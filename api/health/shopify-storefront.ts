import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkShopifyStorefrontHealth } from "../_lib/shopify-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
        store: "dbbys1-nd.myshopify.com",
        apiVersion: "2026-07",
      },
      error: err?.message || "Unexpected error checking Storefront health",
    });
  }
}

