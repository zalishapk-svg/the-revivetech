import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getConfig, shopifyStorage } from "../_lib/shopify-server.js";

// To parse raw body for webhook HMAC validation in Vercel functions:
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    req.on("data", (chunk: any) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", (err: any) => reject(err));
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const topic = (req.headers["x-shopify-topic"] as string) || "unknown";
  const shop = (req.headers["x-shopify-shop-domain"] as string) || "unknown";
  const hmacHeader = req.headers["x-shopify-hmac-sha256"] as string;

  console.log(`[Shopify Webhook Received] Topic: ${topic} | Shop: ${shop}`);

  const rawBodyBuffer = await getRawBody(req);
  const sysConfig = getConfig();

  const webhookSecret = sysConfig.webhookSecret || sysConfig.clientSecret;

  if (webhookSecret && hmacHeader) {
    const generatedHmac = crypto.createHmac("sha256", webhookSecret).update(rawBodyBuffer).digest("base64");

    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(hmacHeader, "utf-8"),
        Buffer.from(generatedHmac, "utf-8")
      );

      if (!isValid) {
        console.error("[Shopify Webhook HMAC Error] Signature mismatch! Rejecting request.");
        return res.status(401).json({ error: "Invalid Shopify webhook HMAC signature" });
      }
      console.log("[Shopify Webhook HMAC Success] Authenticity verified successfully.");
    } catch (err) {
      console.error("[Shopify Webhook HMAC Exception]", err);
      return res.status(401).json({ error: "Webhook signature verification error" });
    }
  } else if (!webhookSecret) {
    console.warn(
      "[Shopify Webhook Warning] Neither SHOPIFY_WEBHOOK_SECRET nor SHOPIFY_CLIENT_SECRET is configured."
    );
  }

  if (topic === "app/uninstalled") {
    console.log(`[Shopify Webhook] Processing app uninstallation for shop: ${shop}`);
    await shopifyStorage.deleteSession(shop);
  }

  return res.status(200).json({
    received: true,
    topic,
    shop,
    timestamp: new Date().toISOString(),
    hmacVerified: Boolean(webhookSecret && hmacHeader),
  });
}
