import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig, shopifyStorage, STABLE_ADMIN_API_VERSION, REQUIRED_ADMIN_SCOPES } from "../_lib/shopify-server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const config = getConfig();
    const token = await shopifyStorage.getOrFetchAdminToken(config.storeDomain);
    const session = await shopifyStorage.getSession(config.storeDomain);

    return res.status(200).json({
      hasToken: Boolean(token || session?.accessToken),
      shop: session?.shop || config.storeDomain,
      scope: session?.scope || REQUIRED_ADMIN_SCOPES.join(","),
      updatedAt: session?.updatedAt || null,
      apiVersion: STABLE_ADMIN_API_VERSION,
    });
  } catch (err: any) {
    return res.status(200).json({
      hasToken: false,
      shop: "dbbys1-nd.myshopify.com",
      scope: REQUIRED_ADMIN_SCOPES.join(","),
      updatedAt: null,
      apiVersion: STABLE_ADMIN_API_VERSION,
      error: err?.message || "Error retrieving token status",
    });
  }
}

