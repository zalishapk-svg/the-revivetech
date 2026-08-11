import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getConfig, shopifyStorage, getAppBaseUrl, REQUIRED_ADMIN_SCOPES } from "../_lib/shopify-server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = (req.query.action as string) || "";
  const rawUrl = req.url || "";
  const isCallback = action === "callback" || rawUrl.includes("auth/callback");

  // Handle OAuth Callback Flow
  if (isCallback) {
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
      delete queryObj.action;

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
  }

  // Handle OAuth Initiation Flow
  try {
    const config = getConfig();
    const shopQuery = (req.query.shop as string) || config.storeDomain;

    if (!shopQuery) {
      return res.status(400).send("Missing shop query parameter (e.g. ?shop=dbbys1-nd.myshopify.com)");
    }

    const shop = shopifyStorage.cleanDomain(shopQuery);
    const clientId = config.clientId;

    if (!clientId) {
      return res.status(400).json({
        error: "SHOPIFY_CLIENT_ID is not configured. Please set SHOPIFY_CLIENT_ID in environment variables.",
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
  } catch (err: any) {
    console.error("[Shopify Auth Init Error]", err);
    return res.status(500).json({ error: err?.message || "Failed to initiate Shopify OAuth flow" });
  }
}
