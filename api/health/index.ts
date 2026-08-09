import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig, shopifyStorage, STABLE_ADMIN_API_VERSION } from "../_lib/shopify-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const config = getConfig();
  const session = await shopifyStorage.getSession(config.storeDomain);

  return res.status(200).json({
    status: "ok",
    apiVersion: STABLE_ADMIN_API_VERSION,
    storeDomain: config.storeDomain,
    hasAdminToken: Boolean(session?.accessToken),
  });
}
