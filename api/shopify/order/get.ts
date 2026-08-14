import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrderConfirmationRecord } from "../../_lib/shopify-server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  try {
    const reference = (req.query.reference as string) || "";
    if (!reference) {
      return res.status(400).json({ error: "Missing order reference parameter." });
    }

    const orderData = await getOrderConfirmationRecord(reference);

    if (!orderData) {
      return res.status(404).json({ error: "Order reference not found or expired." });
    }

    return res.status(200).json({
      success: true,
      order: orderData,
    });
  } catch (error: any) {
    console.error("[Get Order API Exception]", error);
    return res.status(500).json({
      error: error?.message || "Failed to retrieve order confirmation details.",
    });
  }
}
