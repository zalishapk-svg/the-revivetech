import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkShopifyStorefrontHealth } from "../_lib/shopify-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const health = await checkShopifyStorefrontHealth();
  if (health.connected) {
    return res.status(200).json({
      status: "ok",
      storefront: {
        connected: true,
        store: health.storeDomain,
        apiVersion: health.apiVersion,
      },
    });
  } else {
    return res.status(500).json({
      status: "error",
      storefront: {
        connected: false,
        store: health.storeDomain,
        apiVersion: health.apiVersion,
      },
      error: health.error || "Failed to communicate with Shopify Storefront API",
    });
  }
}
