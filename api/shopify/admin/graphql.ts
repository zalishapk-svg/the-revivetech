import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig, shopifyStorage, STABLE_ADMIN_API_VERSION } from "../../_lib/shopify-server";

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
    const domain = config.storeDomain;

    let token = await shopifyStorage.getOrFetchAdminToken(domain);

    if (!token) {
      return res.status(401).json({
        errors: [
          {
            message:
              "Failed to acquire Shopify Admin API access token. Please verify SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET are configured in environment variables.",
          },
        ],
      });
    }

    const endpoint = `https://${domain}/admin/api/${STABLE_ADMIN_API_VERSION}/graphql.json`;

    let response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (response.status === 401) {
      console.warn("[Admin API Proxy] Received 401 Unauthorized from Shopify. Attempting token force refresh...");
      token = await shopifyStorage.getOrFetchAdminToken(domain, true);
      if (token) {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Shopify-Access-Token": token,
          },
          body: JSON.stringify({ query, variables }),
        });
      }
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Shopify Admin API Proxy Error:", error);
    return res.status(500).json({
      errors: [{ message: error.message || "Failed to communicate with Shopify Admin API" }],
    });
  }
}
