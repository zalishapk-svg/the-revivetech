import type { VercelRequest, VercelResponse } from "@vercel/node";
import { calculateShippingRates } from "../_lib/shopify-server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use POST or GET." });
  }

  try {
    const body = req.method === "POST" ? req.body : req.query;
    const subtotal = parseFloat(String(body?.subtotal || 0));

    const rates = calculateShippingRates(subtotal);

    return res.status(200).json({
      success: true,
      rates,
    });
  } catch (error: any) {
    console.error("[Shipping Rates API Exception]", error);
    return res.status(500).json({
      error: error?.message || "Failed to calculate shipping rates.",
    });
  }
}
