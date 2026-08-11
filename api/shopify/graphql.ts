import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig, STABLE_STOREFRONT_API_VERSION } from "../_lib/shopify-server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { query, variables } = req.body || {};
    if (!query) {
      return res.status(400).json({ error: "Missing GraphQL query" });
    }

    const config = getConfig();
    const domain = config.storeDomain || "dbbys1-nd.myshopify.com";
    const token = config.storefrontToken;

    const endpoint = `https://${domain}/api/${STABLE_STOREFRONT_API_VERSION}/graphql.json`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers["X-Shopify-Storefront-Access-Token"] = token;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Shopify Storefront Proxy Error:", error);
    return res.status(500).json({
      errors: [{ message: error.message || "Failed to communicate with Shopify Storefront API" }],
    });
  }
}
