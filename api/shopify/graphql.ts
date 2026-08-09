import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig, STABLE_ADMIN_API_VERSION } from "../_lib/shopify-server";

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
    const domain = config.storeDomain || "mock.shop";
    const token = config.storefrontToken;

    let endpoint = "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (domain === "mock.shop" || domain.includes("mock.shop")) {
      endpoint = "https://mock.shop/api";
    } else {
      endpoint = `https://${domain}/api/${STABLE_ADMIN_API_VERSION}/graphql.json`;
      if (token) {
        headers["X-Shopify-Storefront-Access-Token"] = token;
      }
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
