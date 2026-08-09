import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig, shopifyStorage, getAppBaseUrl, STABLE_ADMIN_API_VERSION, REQUIRED_ADMIN_SCOPES } from "../_lib/shopify-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const config = getConfig();
  const domain = config.storeDomain;
  const token = await shopifyStorage.getOrFetchAdminToken(domain);
  const session = await shopifyStorage.getSession(domain);
  const baseUrl = getAppBaseUrl(req);
  const authUrl = `${baseUrl}/api/shopify/auth?shop=${encodeURIComponent(domain)}`;

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
      authUrl,
      tokenUpdatedAt: session?.updatedAt || null,
      isMockShop: domain === "mock.shop",
    },
  });
}
