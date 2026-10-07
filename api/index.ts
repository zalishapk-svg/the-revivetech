import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import {
  getConfig,
  shopifyStorage,
  getAppBaseUrl,
  STABLE_ADMIN_API_VERSION,
  STABLE_STOREFRONT_API_VERSION,
  REQUIRED_ADMIN_SCOPES,
  checkFirebaseAdminHealth,
  checkShopifyStorefrontHealth,
  validateShopifyCartItems,
  createShopifyAdminOrder,
  getOrderConfirmationRecord,
  fetchShopifyShippingRates,
} from "./_lib/shopify-server.js";
import { renderSeoPage, loadHtmlTemplate } from "./_lib/seo-renderer.js";
import { generateSitemapXml } from "./_lib/sitemap-generator.js";

/**
 * Normalizes the requested route path from Vercel query or url.
 */
function getCleanPath(req: VercelRequest): string {
  if (typeof req.query.path === "string" && req.query.path.trim()) {
    return req.query.path.trim().replace(/^\/+|\/+$/g, "");
  }
  if (Array.isArray(req.query.path) && req.query.path.length > 0) {
    return req.query.path.join("/").replace(/^\/+|\/+$/g, "");
  }
  const urlWithoutQuery = (req.url || "").split("?")[0];
  return urlWithoutQuery.replace(/^\/api\/?/, "").replace(/^\/+|\/+$/g, "");
}

/**
 * In-memory cache for Storefront GraphQL queries (serverless lifecycle)
 */
const storefrontCache = new Map<string, { timestamp: number; data: any }>();
const STOREFRONT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Unified Serverless Function router for all ReviveTech backend APIs.
 * Deploys as a SINGLE Serverless Function on Vercel Hobby plan (1 <= 12 limit).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable standard CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Shopify-Access-Token, X-Shopify-Storefront-Access-Token, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const path = getCleanPath(req);
  const rawUrl = req.url || "";
  const config = getConfig();

  // -------------------------------------------------------------------------
  // 0. SHOPIFY NATIVE CHECKOUT REDIRECT ROUTER
  // -------------------------------------------------------------------------
  // Intercepts /cart/c/*, /checkouts/*, and shopify-checkout-redirect requests on Vercel
  // and redirects them directly to the Shopify checkout host without hitting the SPA.
  if (
    path === "shopify-checkout-redirect" ||
    path.startsWith("cart/c/") ||
    path.startsWith("checkouts/") ||
    path.startsWith("cart/") ||
    path === "checkout" ||
    rawUrl.includes("/cart/c/") ||
    rawUrl.includes("/checkouts/")
  ) {
    const targetHost = config.checkoutDomain || config.storeDomain || "dbbys1-nd.myshopify.com";
    const originalUrl = (req.headers["x-forwarded-uri"] as string) || (req.headers["x-matched-path"] as string) || rawUrl;
    
    // Match the original checkout path
    const pathMatch = originalUrl.match(/(\/cart\/c\/[^?#]+|\/checkouts\/[^?#]+|\/cart\/[^?#]+\/checkouts\/[^?#]+)/);
    let targetPath = pathMatch ? pathMatch[0] : "";
    if (!targetPath) {
      if (typeof req.query.checkout_path === "string") {
        targetPath = `/${req.query.checkout_path.replace(/^\/+/, "")}`;
      } else if (path.startsWith("cart/c/") || path.startsWith("checkouts/") || path.startsWith("cart/")) {
        targetPath = `/${path}`;
      } else {
        targetPath = "/cart";
      }
    }

    // Build URL preserving all query params (key, _s, _y, etc.) intact
    const dummyBase = `https://${targetHost}`;
    let searchParamsStr = "";
    try {
      const parsedUrl = new URL(originalUrl, dummyBase);
      parsedUrl.searchParams.delete("path");
      parsedUrl.searchParams.delete("checkout_path");
      searchParamsStr = parsedUrl.search;
    } catch {
      const queryIdx = originalUrl.indexOf("?");
      if (queryIdx !== -1) {
        searchParamsStr = originalUrl.substring(queryIdx);
      }
    }

    const finalCheckoutUrl = `https://${targetHost}${targetPath}${searchParamsStr}`;
    console.log(`[Shopify Checkout Redirect] Redirecting browser to native Shopify Checkout: ${finalCheckoutUrl}`);
    return res.redirect(302, finalCheckoutUrl);
  }

  // -------------------------------------------------------------------------
  // 0A. SITEMAP.XML & ROBOTS.TXT ROUTER (High Priority Technical SEO)
  // -------------------------------------------------------------------------
  const isSitemapRequest =
    path === "sitemap" ||
    path === "sitemap.xml" ||
    path === "sitemap_index.xml" ||
    rawUrl.startsWith("/sitemap") ||
    rawUrl.includes("sitemap.xml");

  if (isSitemapRequest) {
    try {
      const xml = await generateSitemapXml();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader(
        "Cache-Control",
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
      );
      return res.status(200).send(xml);
    } catch (err: any) {
      console.error("[Sitemap Generation Error in Vercel Function]", err);
      const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://www.therevivetech.pk/</loc><priority>1.0</priority></url>\n  <url><loc>https://www.therevivetech.pk/shop</loc><priority>0.9</priority></url>\n  <url><loc>https://www.therevivetech.pk/collections</loc><priority>0.9</priority></url>\n</urlset>`;
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      return res.status(200).send(fallbackXml);
    }
  }

  const isRobotsRequest =
    path === "robots" ||
    path === "robots.txt" ||
    rawUrl.startsWith("/robots") ||
    rawUrl.includes("robots.txt");

  if (isRobotsRequest) {
    const robotsTxt = `# The Revive Tech Robots TXT
User-agent: *
Allow: /
Allow: /api/shopify/config
Allow: /api/shopify/graphql
Disallow: /api/
Disallow: /admin/
Disallow: /account/
Disallow: /cart
Disallow: /checkout
Disallow: /checkouts/

Sitemap: https://www.therevivetech.pk/sitemap.xml
`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(robotsTxt);
  }

  // -------------------------------------------------------------------------
  // 0B. TECHNICAL SEO & INITIAL HTML PRERENDERING ROUTER (Vercel Serverless)
  // -------------------------------------------------------------------------
  // Intercepts all page requests to render real Shopify SEO metadata and
  // crawlable semantic HTML before React hydrates on the client.
  const isHtmlRequest =
    !isSitemapRequest &&
    !isRobotsRequest &&
    (path === "__html__" ||
      typeof req.query.html_path === "string" ||
      req.query.render_html === "true" ||
      (req.method === "GET" &&
        Boolean(req.headers.accept?.includes("text/html")) &&
        !path.startsWith("api/") &&
        !path.startsWith("shopify/") &&
        !path.startsWith("health") &&
        !path.startsWith("debug") &&
        !path.endsWith(".json") &&
        !path.endsWith(".xml") &&
        !path.endsWith(".txt")));

  if (isHtmlRequest) {
    try {
      let targetPath = "/";
      if (typeof req.query.html_path === "string" && req.query.html_path.trim()) {
        targetPath = req.query.html_path.trim();
      } else if (req.headers["x-forwarded-uri"]) {
        targetPath = (req.headers["x-forwarded-uri"] as string).split("?")[0];
      } else if (req.headers["x-matched-path"]) {
        targetPath = (req.headers["x-matched-path"] as string).split("?")[0];
      } else if (rawUrl && !rawUrl.startsWith("/api/")) {
        targetPath = rawUrl.split("?")[0];
      } else if (path && path !== "__html__") {
        targetPath = `/${path}`;
      }

      if (!targetPath.startsWith("/")) {
        targetPath = `/${targetPath}`;
      }

      const template = loadHtmlTemplate();
      const seoResult = await renderSeoPage(targetPath, template, req.headers.host);

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      if (seoResult.statusCode === 200) {
        res.setHeader(
          "Cache-Control",
          "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400"
        );
      } else {
        res.setHeader("Cache-Control", "no-store");
      }
      return res.status(seoResult.statusCode).send(seoResult.html);
    } catch (seoErr) {
      console.error("[SEO Prerender Error in Vercel Function]", seoErr);
      const fallbackTemplate = loadHtmlTemplate();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(fallbackTemplate);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. HEALTH & DIAGNOSTIC ENDPOINTS
    // -------------------------------------------------------------------------

    // 1a. Firebase Health Check
    if (path === "health/firebase" || path === "firebase") {
      try {
        const health = await checkFirebaseAdminHealth();
        return res.status(200).json({
          status: health.connected ? "ok" : "unconfigured",
          firebase: {
            connected: health.connected,
            projectId: health.projectId || null,
            firestore: health.firestore,
          },
          error: health.error || null,
        });
      } catch (err: any) {
        return res.status(200).json({
          status: "error",
          firebase: { connected: false, firestore: false },
          error: err?.message || "Unexpected error checking Firebase health",
        });
      }
    }

    // 1b. Shopify Storefront Health Check
    if (path === "health/shopify-storefront" || path === "shopify-storefront") {
      try {
        const health = await checkShopifyStorefrontHealth();
        return res.status(200).json({
          status: health.connected ? "ok" : "degraded",
          storefront: {
            connected: health.connected,
            store: health.storeDomain,
            apiVersion: health.apiVersion,
          },
          error: health.error || null,
        });
      } catch (err: any) {
        return res.status(200).json({
          status: "error",
          storefront: {
            connected: false,
            store: config.storeDomain,
            apiVersion: STABLE_STOREFRONT_API_VERSION,
          },
          error: err?.message || "Storefront health check failed",
        });
      }
    }

    // 1c. Safe Shopify Data Diagnostic Endpoint
    if (path === "debug/shopify-storefront") {
      try {
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
              edges { node { id title handle } }
            }
            collections(first: 10) {
              edges { node { id title handle } }
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

        return res.status(200).json({
          connected: true,
          productsFound: productEdges.length,
          collectionsFound: collectionEdges.length,
          sampleProducts: productEdges.map((e: any) => ({
            title: e.node?.title || "",
            handle: e.node?.handle || "",
          })),
          sampleCollections: collectionEdges.map((e: any) => ({
            title: e.node?.title || "",
            handle: e.node?.handle || "",
          })),
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
    }

    // 1d. General Health Check
    if (path === "health" || path === "") {
      const token = await shopifyStorage.getOrFetchAdminToken(config.storeDomain);
      const session = await shopifyStorage.getSession(config.storeDomain);
      return res.status(200).json({
        status: "ok",
        apiVersion: STABLE_ADMIN_API_VERSION,
        storeDomain: config.storeDomain,
        hasAdminToken: Boolean(token || session?.accessToken),
      });
    }

    // -------------------------------------------------------------------------
    // 2. SHOPIFY STOREFRONT & ADMIN GRAPHQL PROXIES
    // -------------------------------------------------------------------------

    // 2a. Storefront GraphQL Proxy with Cache
    if (path === "shopify/graphql") {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
      }

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
    }

    // 2b. Admin GraphQL Proxy
    if (path === "shopify/admin/graphql") {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
      }

      const { query, variables } = req.body || {};
      if (!query) {
        return res.status(400).json({ error: "Missing GraphQL query" });
      }

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

      // Token invalidation / refresh retry
      if (response.status === 401) {
        console.warn("[Admin API] Token 401 received. Attempting to refresh access token...");
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
    }

    // -------------------------------------------------------------------------
    // 3. SHOPIFY STORE CONFIGURATION & TOKEN STATUS
    // -------------------------------------------------------------------------

    // 3a. Store Config & Diagnostics
    if (path === "shopify/config") {
      const domain = config.storeDomain;
      const token = await shopifyStorage.getOrFetchAdminToken(domain);
      const session = await shopifyStorage.getSession(domain);
      const baseUrl = getAppBaseUrl(req);

      if (req.method === "POST") {
        const { storeDomain, storefrontToken, adminApiToken, clientId, clientSecret, webhookSecret } = req.body || {};

        let targetDomain = domain;
        if (storeDomain) {
          targetDomain = shopifyStorage.cleanDomain(storeDomain);
        }
        if (adminApiToken && adminApiToken.trim()) {
          await shopifyStorage.saveSession(targetDomain, adminApiToken.trim());
        }

        const updatedToken = await shopifyStorage.getOrFetchAdminToken(targetDomain);
        const updatedSession = await shopifyStorage.getSession(targetDomain);

        return res.status(200).json({
          status: "updated",
          config: {
            storeDomain: targetDomain,
            hasStorefrontToken: Boolean(storefrontToken || config.storefrontToken),
            hasAdminApiToken: Boolean(updatedToken || updatedSession?.accessToken),
            hasClientId: Boolean(clientId || config.clientId),
            hasClientSecret: Boolean(clientSecret || config.clientSecret),
            hasWebhookSecret: Boolean(webhookSecret || config.webhookSecret),
            apiVersion: STABLE_ADMIN_API_VERSION,
            authUrl: `${baseUrl}/api/shopify/auth?shop=${encodeURIComponent(targetDomain)}`,
            isMockShop: targetDomain === "mock.shop",
          },
        });
      }

      return res.status(200).json({
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
          authUrl: `${baseUrl}/api/shopify/auth?shop=${encodeURIComponent(domain)}`,
          tokenUpdatedAt: session?.updatedAt || null,
          isMockShop: domain === "mock.shop",
        },
      });
    }

    // 3b. Token Status
    if (path === "shopify/token-status") {
      const token = await shopifyStorage.getOrFetchAdminToken(config.storeDomain);
      const session = await shopifyStorage.getSession(config.storeDomain);

      return res.status(200).json({
        hasToken: Boolean(token || session?.accessToken),
        shop: session?.shop || config.storeDomain,
        scope: session?.scope || REQUIRED_ADMIN_SCOPES.join(","),
        updatedAt: session?.updatedAt || null,
        apiVersion: STABLE_ADMIN_API_VERSION,
      });
    }

    // -------------------------------------------------------------------------
    // 4. SHOPIFY OAUTH FLOWS
    // -------------------------------------------------------------------------
    if (path === "shopify/auth" || path === "shopify/auth/callback") {
      const isCallback =
        path === "shopify/auth/callback" || req.query.action === "callback" || rawUrl.includes("auth/callback");

      if (isCallback) {
        const { code, shop, hmac } = req.query;
        if (!code || !shop) {
          return res.status(400).send("Invalid OAuth callback parameters. Missing authorization code or shop.");
        }

        const shopDomain = shopifyStorage.cleanDomain(shop as string);
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
          delete queryObj.action;
          delete queryObj.path;

          const message = Object.keys(queryObj)
            .sort()
            .map((key) => `${key}=${queryObj[key]}`)
            .join("&");

          const generatedHmac = crypto.createHmac("sha256", clientSecret).update(message).digest("hex");
          if (generatedHmac !== hmac) {
            console.warn("[Shopify OAuth] Warning: HMAC validation mismatch on callback query string.");
          }
        }

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
          const errorBody = await tokenResponse.text();
          return res.status(tokenResponse.status).send(`Failed to exchange code for access token: ${errorBody}`);
        }

        const tokenData = await tokenResponse.json();
        await shopifyStorage.saveSession(shopDomain, tokenData.access_token, tokenData.scope);

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Shopify Authorization Successful</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #030705; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
                .card { background: #0f172a; border: 1px solid #065f46; border-radius: 16px; padding: 32px; max-width: 480px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .badge { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 16px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; margin-bottom: 20px; font-size: 32px; }
                h1 { margin: 0 0 8px; font-size: 22px; font-weight: 800; }
                p { color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 24px; }
                .btn { display: inline-block; background: #10b981; color: #022c22; font-weight: 700; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 14px; transition: background 0.2s; }
                .btn:hover { background: #34d399; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="badge">✓</div>
                <h1>ReviveTech Store Connected</h1>
                <p>Offline Admin API permissions have been granted for <strong>${shopDomain}</strong>. The access token is securely synchronized with your storefront.</p>
                <a href="/" class="btn">Return to Storefront</a>
              </div>
            </body>
          </html>
        `;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(html);
      }

      // Initiation
      const rawShop = (req.query.shop as string) || config.storeDomain;
      const shopDomain = shopifyStorage.cleanDomain(rawShop);
      const clientId = config.clientId;
      const baseUrl = getAppBaseUrl(req);
      const redirectUri = `${baseUrl}/api/shopify/auth?action=callback`;

      if (!clientId) {
        return res
          .status(400)
          .send("Missing SHOPIFY_CLIENT_ID configuration. Please configure it in your environment variables.");
      }

      const scopes = REQUIRED_ADMIN_SCOPES.join(",");
      const state = crypto.randomBytes(16).toString("hex");
      const authorizationUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${encodeURIComponent(
        clientId
      )}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

      return res.redirect(302, authorizationUrl);
    }

    // -------------------------------------------------------------------------
    // 5. SHIPPING RATES & ORDER OPERATIONS
    // -------------------------------------------------------------------------

    // 5a. Calculate Dynamic Shopify Shipping Rates
    if (path === "shopify/shipping-rates" || path === "shipping-rates" || path === "checkout/shipping-rates") {
      const body = req.method === "POST" ? req.body : req.query;
      const items = body?.items || [];
      const shippingAddress = body?.shippingAddress;
      const rates = await fetchShopifyShippingRates(items, shippingAddress, config.storeDomain);
      return res.status(200).json({ success: true, rates });
    }

    // 5b. Create Custom COD / Online Order (Shopify Admin API + Client Credentials)
    if (
      path === "checkout/create" ||
      path === "shopify/order/create" ||
      path === "order/create" ||
      path === "shopify/checkout/create"
    ) {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
      }

      const { customer, shippingAddress, items, shippingMethodId, discountCode, notes } = req.body || {};

      if (!customer?.firstName?.trim() || !customer?.lastName?.trim()) {
        return res.status(400).json({ error: "First and last name are required." });
      }
      if (!customer?.email?.trim() || !customer.email.includes("@")) {
        return res.status(400).json({ error: "A valid email address is required for order confirmation." });
      }
      if (!customer?.phone?.trim() || customer.phone.trim().length < 8) {
        return res.status(400).json({ error: "A valid phone number is required for Cash on Delivery dispatch." });
      }

      if (!shippingAddress?.address1?.trim()) {
        return res.status(400).json({ error: "Complete delivery address is required." });
      }
      if (!shippingAddress?.city?.trim()) {
        return res.status(400).json({ error: "City is required." });
      }
      if (!shippingAddress?.province?.trim()) {
        return res.status(400).json({ error: "Province is required." });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Your shopping cart is empty." });
      }

      // Step 1: Validate items with Shopify Inventory
      const inventoryResult = await validateShopifyCartItems(items, config.storeDomain);
      if (!inventoryResult.valid || !inventoryResult.validatedItems.length) {
        return res.status(400).json({
          error: inventoryResult.error || "Unable to verify stock or prices for your items.",
          code: "INVENTORY_ERROR",
        });
      }

      const validatedSubtotal = inventoryResult.subtotal;
      const availableShippingRates = await fetchShopifyShippingRates(items, shippingAddress, config.storeDomain);
      const selectedRate =
        availableShippingRates.find((r) => r.id === shippingMethodId) || availableShippingRates[0];

      let discountAmount = 0;
      const upperCode = (discountCode || "").trim().toUpperCase();
      if (upperCode === "REVIVE10" || upperCode === "WELCOME10") {
        discountAmount = Math.round(validatedSubtotal * 0.1);
      } else if (upperCode === "REVIVE5") {
        discountAmount = Math.round(validatedSubtotal * 0.05);
      }

      // Step 2: Create Real Order in Shopify Admin
      const orderCreationResult = await createShopifyAdminOrder({
        customer: {
          firstName: customer.firstName.trim(),
          lastName: customer.lastName.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim(),
        },
        shippingAddress: {
          address1: shippingAddress.address1.trim(),
          city: shippingAddress.city.trim(),
          province: shippingAddress.province.trim(),
          postalCode: (shippingAddress.postalCode || "").trim() || "00000",
          country: (shippingAddress.country || "Pakistan").trim(),
        },
        validatedItems: inventoryResult.validatedItems,
        shippingMethod: {
          title: selectedRate.title,
          price: selectedRate.price,
          code: selectedRate.id,
        },
        discountCode: discountAmount > 0 ? upperCode : undefined,
        discountAmount,
        notes: notes?.trim(),
        storeDomain: config.storeDomain,
        reqHost: req.headers?.host,
      });

      if (!orderCreationResult.success) {
        return res.status(500).json({
          error: orderCreationResult.error || "Failed to create order on Shopify.",
        });
      }

      return res.status(200).json({
        success: true,
        orderReference: orderCreationResult.orderReference,
        orderNumber: orderCreationResult.orderNumber,
        shopifyOrderId: orderCreationResult.shopifyOrderId,
        totalPrice: orderCreationResult.totalPrice,
        currency: orderCreationResult.currency,
        orderData: orderCreationResult.orderData,
      });
    }

    // 5c. Get Order Details by Reference / ID
    if (
      path.startsWith("shopify/order/") ||
      path.startsWith("order/") ||
      path === "shopify/order/get" ||
      path === "order/get"
    ) {
      let reference = (req.query.reference as string) || "";

      if (!reference && path.startsWith("shopify/order/")) {
        reference = path.replace(/^shopify\/order\//, "").trim();
      } else if (!reference && path.startsWith("order/")) {
        reference = path.replace(/^order\//, "").trim();
      }

      if (!reference) {
        return res.status(400).json({ error: "Missing order reference parameter." });
      }

      const orderData = await getOrderConfirmationRecord(reference);
      if (!orderData) {
        return res.status(404).json({ error: "Order reference not found." });
      }

      return res.status(200).json({
        success: true,
        order: orderData,
      });
    }

    // -------------------------------------------------------------------------
    // 6. SHOPIFY WEBHOOKS
    // -------------------------------------------------------------------------
    if (path === "shopify/webhooks") {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
      }

      const topic = (req.headers["x-shopify-topic"] as string) || "unknown";
      const shop = (req.headers["x-shopify-shop-domain"] as string) || "unknown";
      const hmacHeader = req.headers["x-shopify-hmac-sha256"] as string;

      console.log(`[Shopify Webhook Received] Topic: ${topic} | Shop: ${shop}`);

      const webhookSecret = config.webhookSecret || config.clientSecret;
      if (webhookSecret && hmacHeader && typeof req.body === "object") {
        try {
          const bodyString = JSON.stringify(req.body);
          const generatedHmac = crypto.createHmac("sha256", webhookSecret).update(bodyString).digest("base64");
          if (generatedHmac !== hmacHeader) {
            console.warn(`[Shopify Webhook Warning] HMAC signature mismatch for topic: ${topic}`);
          }
        } catch (e) {
          console.warn("[Shopify Webhook] Note on signature validation:", e);
        }
      }

      if (topic === "app/uninstalled" && shop) {
        console.log(`[Shopify Webhook] Processing app uninstallation for shop: ${shop}`);
        await shopifyStorage.deleteSession(shop);
      }

      return res.status(200).json({
        received: true,
        topic,
        shop,
        timestamp: new Date().toISOString(),
      });
    }

    // -------------------------------------------------------------------------
    // 7. ROBOTS.TXT
    // -------------------------------------------------------------------------
    if (path === "robots" || path === "robots.txt") {
      const robotsTxt = `# The Revive Tech Robots TXT
User-agent: *
Allow: /
Allow: /api/shopify/config
Allow: /api/shopify/graphql
Disallow: /api/
Disallow: /admin/
Disallow: /account/
Disallow: /cart
Disallow: /checkout
Disallow: /checkouts/

Sitemap: https://www.therevivetech.pk/sitemap.xml
`;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(robotsTxt);
    }

    // -------------------------------------------------------------------------
    // 8. SITEMAP.XML
    // -------------------------------------------------------------------------
    if (path === "sitemap" || path === "sitemap.xml" || path === "sitemap_index.xml") {
      try {
        const xml = await generateSitemapXml();
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.setHeader(
          "Cache-Control",
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
        );
        return res.status(200).send(xml);
      } catch (err: any) {
        console.error("[Sitemap Error in API Handler]", err);
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://www.therevivetech.pk/</loc><priority>1.0</priority></url>\n</urlset>`;
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        return res.status(200).send(fallbackXml);
      }
    }

    // If route is unrecognized in API
    return res.status(404).json({
      error: `API route /api/${path} not found`,
      availableRoutes: [
        "/api/health",
        "/api/health/firebase",
        "/api/health/shopify-storefront",
        "/api/debug/shopify-storefront",
        "/api/shopify/config",
        "/api/shopify/token-status",
        "/api/shopify/auth",
        "/api/shopify/graphql",
        "/api/shopify/admin/graphql",
        "/api/shopify/shipping-rates",
        "/api/shopify/order/create",
        "/api/shopify/order/:reference",
        "/api/shopify/webhooks",
        "/robots.txt",
        "/sitemap.xml",
      ],
    });
  } catch (err: any) {
    console.error("[Unified API Router Error]", err);
    return res.status(500).json({
      error: err?.message || "Internal server error",
    });
  }
}
