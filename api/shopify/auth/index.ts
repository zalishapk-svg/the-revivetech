import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getConfig, shopifyStorage, getAppBaseUrl, REQUIRED_ADMIN_SCOPES } from "../../_lib/shopify-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

