import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { 
  getConfig, shopifyStorage, getAppBaseUrl, 
  STABLE_ADMIN_API_VERSION, STABLE_STOREFRONT_API_VERSION, REQUIRED_ADMIN_SCOPES,
  checkFirebaseAdminHealth, checkShopifyStorefrontHealth
} from "./api/_lib/shopify-server.js";

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
  res.json({
    status: health.connected ? "ok" : "error",
    firebase: {
      connected: health.connected,
      projectId: health.projectId || "revivetech-32287",
      firestore: health.firestore,
    },
    error: health.error || null,
  });
});

// Shopify Storefront Health Check Endpoint
app.get("/api/health/shopify-storefront", async (req, res) => {
  const health = await checkShopifyStorefrontHealth();
  res.json({
    status: health.connected ? "ok" : "degraded",
    storefront: {
      connected: health.connected,
      store: health.storeDomain,
      apiVersion: health.apiVersion,
    },
    error: health.error || null,
  });
});

// Safe Shopify Data Diagnostic Endpoint
app.get("/api/debug/shopify-storefront", async (req, res) => {
  try {
    const config = getConfig();
    const domain = config.storeDomain || "dbbys1-nd.myshopify.com";
    const endpoint = `https://${domain}/api/${STABLE_STOREFRONT_API_VERSION}/graphql.json`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (config.storefrontToken) {
      headers["X-Shopify-Storefront-Access-Token"] = config.storefrontToken;
    }

    const query = `
      query debugStorefront {
        products(first: 10) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
        collections(first: 10) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      return res.status(200).json({
        connected: false,
        productsFound: 0,
        collectionsFound: 0,
        sampleProducts: [],
        sampleCollections: [],
        error: `Storefront API returned HTTP ${response.status}`,
      });
    }

    const data = await response.json();
    if (data.errors && data.errors.length > 0) {
      return res.status(200).json({
        connected: false,
        productsFound: 0,
        collectionsFound: 0,
        sampleProducts: [],
        sampleCollections: [],
        error: data.errors[0]?.message || "GraphQL Error",
      });
    }

    const productEdges = data.data?.products?.edges || [];
    const collectionEdges = data.data?.collections?.edges || [];

    const sampleProducts = productEdges.map((e: any) => ({
      title: e.node?.title || "",
      handle: e.node?.handle || "",
    }));

    const sampleCollections = collectionEdges.map((e: any) => ({
      title: e.node?.title || "",
      handle: e.node?.handle || "",
    }));

    return res.status(200).json({
      connected: true,
      productsFound: sampleProducts.length,
      collectionsFound: sampleCollections.length,
      sampleProducts,
      sampleCollections,
    });
  } catch (error: any) {
    return res.status(200).json({
      connected: false,
      productsFound: 0,
      collectionsFound: 0,
      sampleProducts: [],
      sampleCollections: [],
      error: error?.message || "Failed to query Storefront API",
    });
  }
});

// Robots.txt Handler
app.get("/robots.txt", (req, res) => {
  const host = req.headers.host || "therevivetech.pk";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const baseUrl = `${protocol}://${host}`;

  const robotsTxt = `# The Revive Tech Robots TXT
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /account/

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(robotsTxt);
});

// Sitemap.xml Handler
app.get("/sitemap.xml", async (req, res) => {
  const host = req.headers.host || "therevivetech.pk";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const baseUrl = `${protocol}://${host}`;

  const staticRoutes = [
    "",
    "/shop",
    "/collections",
    "/about",
    "/contact",
    "/blog",
    "/faq",
    "/cart",
    "/search",
  ];

  let collectionHandles: string[] = [];
  let productHandles: string[] = [];

  try {
    const config = getConfig();
    const domain = config.storeDomain || "dbbys1-nd.myshopify.com";
    const endpoint = `https://${domain}/api/${STABLE_STOREFRONT_API_VERSION}/graphql.json`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (config.storefrontToken) {
      headers["X-Shopify-Storefront-Access-Token"] = config.storefrontToken;
    }

    const query = `
      query getSitemapData {
        collections(first: 50) {
          edges { node { handle } }
        }
        products(first: 100) {
          edges { node { handle } }
        }
      }
    `;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data?.collections?.edges) {
        collectionHandles = data.data.collections.edges.map((e: any) => e.node.handle);
      }
      if (data.data?.products?.edges) {
        productHandles = data.data.products.edges.map((e: any) => e.node.handle);
      }
    }
  } catch (err) {
    console.error("Failed to fetch sitemap handles from Shopify:", err);
  }

  const currentDate = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${route === "" ? "daily" : "weekly"}</changefreq>\n`;
    xml += `    <priority>${route === "" ? "1.0" : "0.8"}</priority>\n`;
    xml += `  </url>\n`;
  }

  for (const handle of collectionHandles) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/collections/${handle}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  for (const handle of productHandles) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/products/${handle}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.status(200).send(xml);
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

// Storefront GraphQL Proxy with 5-minute In-Memory Query Cache
const storefrontCache = new Map<string, { timestamp: number; data: any }>();
const STOREFRONT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

app.post("/api/shopify/graphql", async (req, res) => {
  try {
    const { query, variables } = req.body || {};
    if (!query) {
      return res.status(400).json({ error: "Missing GraphQL query" });
    }

    const isMutation = query.trim().startsWith("mutation");
    const cacheKey = JSON.stringify({ query, variables: variables || {} });

    if (!isMutation && storefrontCache.has(cacheKey)) {
      const cached = storefrontCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < STOREFRONT_CACHE_TTL_MS) {
        return res.status(200).json(cached.data);
      } else {
        storefrontCache.delete(cacheKey);
      }
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

    if (!isMutation && response.ok && data && !data.errors) {
      storefrontCache.set(cacheKey, { timestamp: Date.now(), data });
    }

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
  // Handle Shopify checkout path redirects
  const handleCheckoutRedirect = (req: express.Request, res: express.Response) => {
    const config = getConfig();
    const domain = config.storeDomain || "dbbys1-nd.myshopify.com";
    const targetUrl = `https://${domain}${req.originalUrl}`;
    console.log(`[Express Checkout Redirect] Forwarding ${req.originalUrl} -> ${targetUrl}`);
    return res.redirect(302, targetUrl);
  };

  app.get(["/cart/c/*", "/cart/checkouts/*", "/checkouts/*", "/cart/k/*"], handleCheckoutRedirect);

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
