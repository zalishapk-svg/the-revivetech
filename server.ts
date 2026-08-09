import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { 
  getConfig, shopifyStorage, getAppBaseUrl, 
  STABLE_ADMIN_API_VERSION, STABLE_STOREFRONT_API_VERSION, REQUIRED_ADMIN_SCOPES,
  checkFirebaseAdminHealth, checkShopifyStorefrontHealth
} from "./api/_lib/shopify-server";

const app = express();
const PORT = 3000;

// Express Middleware: Preserve Raw Body Buffer for Webhook HMAC Verification
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/api/health", async (req, res) => {
  const config = getConfig();
  const token = await shopifyStorage.getOrFetchAdminToken(config.storeDomain);
  const session = await shopifyStorage.getSession(config.storeDomain);
  res.json({
    status: "ok",
    apiVersion: STABLE_ADMIN_API_VERSION,
    storeDomain: config.storeDomain,
    hasAdminToken: Boolean(token || session?.accessToken),
  });
});

// Firebase Health Check Endpoint
app.get("/api/health/firebase", async (req, res) => {
  const health = await checkFirebaseAdminHealth();
  if (health.connected) {
    res.json({
      status: "ok",
      firebase: {
        connected: true,
        projectId: health.projectId,
        firestore: true,
      },
    });
  } else {
    res.status(500).json({
      status: "error",
      firebase: {
        connected: false,
        firestore: false,
      },
      error: health.error || "Firebase Admin SDK initialization failed",
    });
  }
});

// Shopify Storefront Health Check Endpoint
app.get("/api/health/shopify-storefront", async (req, res) => {
  const health = await checkShopifyStorefrontHealth();
  if (health.connected) {
    res.json({
      status: "ok",
      storefront: {
        connected: true,
        store: health.storeDomain,
        apiVersion: health.apiVersion,
      },
    });
  } else {
    res.status(500).json({
      status: "error",
      storefront: {
        connected: false,
        store: health.storeDomain,
        apiVersion: health.apiVersion,
      },
      error: health.error || "Failed to communicate with Shopify Storefront API",
    });
  }
});

// Configuration Endpoints
app.get("/api/shopify/config", async (req, res) => {
  const config = getConfig();
  const domain = config.storeDomain;
  const token = await shopifyStorage.getOrFetchAdminToken(domain);
  const session = await shopifyStorage.getSession(domain);
  const baseUrl = getAppBaseUrl(req);
  const authUrl = `${baseUrl}/api/shopify/auth?shop=${encodeURIComponent(domain)}`;

  res.json({
    status: "ok",
    config: {
      storeDomain: domain,
      hasStorefrontToken: Boolean(config.storefrontToken),
      hasAdminApiToken: Boolean(token || session?.accessToken),
      hasClientId: Boolean(config.clientId),
      hasClientSecret: Boolean(config.clientSecret),
      hasWebhookSecret: Boolean(config.webhookSecret),
      apiVersion: STABLE_ADMIN_API_VERSION,
      requiredScopes: REQUIRED_ADMIN_SCOPES,
      authUrl,
      tokenUpdatedAt: session?.updatedAt || null,
      isMockShop: domain === "mock.shop",
    },
  });
});

app.post("/api/shopify/config", async (req, res) => {
  const { storeDomain, storefrontToken, adminApiToken, clientId, clientSecret, webhookSecret } = req.body || {};
  const config = getConfig();

  let targetDomain = config.storeDomain;
  if (storeDomain) {
    targetDomain = shopifyStorage.cleanDomain(storeDomain);
  }
  if (adminApiToken && adminApiToken.trim()) {
    await shopifyStorage.saveSession(targetDomain, adminApiToken.trim());
  }

  const token = await shopifyStorage.getOrFetchAdminToken(targetDomain);
  const session = await shopifyStorage.getSession(targetDomain);
  const baseUrl = getAppBaseUrl(req);

  res.json({
    status: "updated",
    config: {
      storeDomain: targetDomain,
      hasStorefrontToken: Boolean(storefrontToken || config.storefrontToken),
      hasAdminApiToken: Boolean(token || session?.accessToken),
      hasClientId: Boolean(clientId || config.clientId),
      hasClientSecret: Boolean(clientSecret || config.clientSecret),
      hasWebhookSecret: Boolean(webhookSecret || config.webhookSecret),
      apiVersion: STABLE_ADMIN_API_VERSION,
      authUrl: `${baseUrl}/api/shopify/auth?shop=${encodeURIComponent(targetDomain)}`,
      isMockShop: targetDomain === "mock.shop",
    },
  });
});

app.get("/api/shopify/token-status", async (req, res) => {
  const config = getConfig();
  const token = await shopifyStorage.getOrFetchAdminToken(config.storeDomain);
  const session = await shopifyStorage.getSession(config.storeDomain);
  res.json({
    hasToken: Boolean(token || session?.accessToken),
    shop: session?.shop || config.storeDomain,
    scope: session?.scope || REQUIRED_ADMIN_SCOPES.join(","),
    updatedAt: session?.updatedAt || null,
    apiVersion: STABLE_ADMIN_API_VERSION,
  });
});

// OAuth Endpoints
app.get("/api/shopify/auth", (req, res) => {
  const config = getConfig();
  const shopQuery = (req.query.shop as string) || config.storeDomain;
  if (!shopQuery) {
    return res.status(400).send("Missing shop query parameter (e.g. ?shop=dbbys1-nd.myshopify.com)");
  }

  const shop = shopifyStorage.cleanDomain(shopQuery);
  const clientId = config.clientId;

  if (!clientId) {
    return res.status(400).json({
      error: "SHOPIFY_CLIENT_ID is not configured. Please set SHOPIFY_CLIENT_ID in server environment.",
    });
  }

  const redirectUri = `${getAppBaseUrl(req)}/api/shopify/auth/callback`;
  const state = crypto.randomBytes(16).toString("hex");
  const scopes = REQUIRED_ADMIN_SCOPES.join(",");

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  console.log(`[Shopify OAuth] Redirecting to Shopify Authorization URL for shop: ${shop}`);
  return res.redirect(installUrl);
});

app.get("/api/shopify/auth/callback", async (req, res) => {
  const { code, shop, hmac } = req.query;

  if (!code || !shop) {
    return res.status(400).send("Invalid OAuth callback parameters. Missing authorization code or shop.");
  }

  const shopDomain = shopifyStorage.cleanDomain(shop as string);
  const config = getConfig();
  const clientSecret = config.clientSecret;
  const clientId = config.clientId;

  if (!clientSecret || !clientId) {
    return res
      .status(500)
      .send("Server configuration error: Both SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET must be configured.");
  }

  if (hmac) {
    const queryObj: Record<string, any> = { ...req.query };
    delete queryObj.hmac;
    delete queryObj.signature;

    const message = Object.keys(queryObj)
      .sort()
      .map((key) => `${key}=${queryObj[key]}`)
      .join("&");

    const generatedHmac = crypto.createHmac("sha256", clientSecret).update(message).digest("hex");

    if (generatedHmac !== hmac) {
      console.warn("[Shopify OAuth] Warning: HMAC validation mismatch on callback query string.");
    }
  }

  try {
    console.log(`[Shopify OAuth] Exchanging code for offline Admin API access token with ${shopDomain}...`);
    const tokenEndpoint = `https://${shopDomain}/admin/oauth/access_token`;

    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code as string,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[Shopify OAuth] Token exchange error response:", errorText);
      return res.status(tokenResponse.status).send(`Shopify Token Exchange Failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const grantedScope = tokenData.scope;

    if (!accessToken) {
      return res.status(500).send("Shopify returned invalid empty token during token exchange.");
    }

    await shopifyStorage.saveSession(shopDomain, accessToken, grantedScope);

    console.log(`[Shopify OAuth] Successfully saved persistent session token for ${shopDomain}!`);
    return res.redirect("/?shopify_auth=success");
  } catch (error: any) {
    console.error("[Shopify OAuth] Callback exception:", error);
    return res.status(500).send(`Authentication error: ${error.message || "Failed token exchange"}`);
  }
});

// Storefront GraphQL Proxy
app.post("/api/shopify/graphql", async (req, res) => {
  try {
    const { query, variables } = req.body || {};
    if (!query) {
      return res.status(400).json({ error: "Missing GraphQL query" });
    }

    const config = getConfig();
    const domain = config.storeDomain || "dbbys1-nd.myshopify.com";
    const token = config.storefrontToken;

    const endpoint = `https://${domain}/api/${STABLE_STOREFRONT_API_VERSION}/graphql.json`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers["X-Shopify-Storefront-Access-Token"] = token;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Shopify Storefront Proxy Error:", error);
    return res.status(500).json({
      errors: [{ message: error.message || "Failed to communicate with Shopify Storefront API" }],
    });
  }
});

// Admin GraphQL Proxy
app.post("/api/shopify/admin/graphql", async (req, res) => {
  try {
    const { query, variables } = req.body || {};
    if (!query) {
      return res.status(400).json({ error: "Missing GraphQL query" });
    }

    const config = getConfig();
    const domain = config.storeDomain;

    let token = await shopifyStorage.getOrFetchAdminToken(domain);

    if (!token) {
      return res.status(401).json({
        errors: [
          {
            message:
              "Failed to acquire Shopify Admin API access token. Please verify SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET are configured in environment variables.",
          },
        ],
      });
    }

    const endpoint = `https://${domain}/admin/api/${STABLE_ADMIN_API_VERSION}/graphql.json`;

    let response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (response.status === 401) {
      console.warn("[Admin API Proxy] Received 401 Unauthorized from Shopify. Attempting token force refresh...");
      token = await shopifyStorage.getOrFetchAdminToken(domain, true);
      if (token) {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Shopify-Access-Token": token,
          },
          body: JSON.stringify({ query, variables }),
        });
      }
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Shopify Admin API Proxy Error:", error);
    return res.status(500).json({
      errors: [{ message: error.message || "Failed to communicate with Shopify Admin API" }],
    });
  }
});

// Webhook Receiver
app.post("/api/shopify/webhooks", async (req, res) => {
  const topic = (req.headers["x-shopify-topic"] as string) || "unknown";
  const shop = (req.headers["x-shopify-shop-domain"] as string) || "unknown";
  const hmacHeader = req.headers["x-shopify-hmac-sha256"] as string;

  console.log(`[Shopify Webhook Received] Topic: ${topic} | Shop: ${shop}`);

  const config = getConfig();
  const webhookSecret = config.webhookSecret || config.clientSecret;

  if (webhookSecret && hmacHeader) {
    const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
    const generatedHmac = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("base64");

    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(hmacHeader, "utf-8"),
        Buffer.from(generatedHmac, "utf-8")
      );

      if (!isValid) {
        console.error("[Shopify Webhook HMAC Error] Signature mismatch! Rejecting request.");
        return res.status(401).json({ error: "Invalid Shopify webhook HMAC signature" });
      }
      console.log("[Shopify Webhook HMAC Success] Authenticity verified successfully.");
    } catch (err) {
      console.error("[Shopify Webhook HMAC Exception]", err);
      return res.status(401).json({ error: "Webhook signature verification error" });
    }
  }

  if (topic === "app/uninstalled") {
    console.log(`[Shopify Webhook] Processing app uninstallation for shop: ${shop}`);
    await shopifyStorage.deleteSession(shop as string);
  }

  return res.status(200).json({
    received: true,
    topic,
    shop,
    timestamp: new Date().toISOString(),
    hmacVerified: Boolean(webhookSecret && hmacHeader),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ThereReviveTech Storefront Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
