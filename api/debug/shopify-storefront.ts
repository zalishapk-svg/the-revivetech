import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig, STABLE_STOREFRONT_API_VERSION } from "../_lib/shopify-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const config = getConfig();
    const domain = config.storeDomain || "dbbys1-nd.myshopify.com";
    const endpoint = `https://${domain}/api/${STABLE_STOREFRONT_API_VERSION}/graphql.json`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (config.storefrontToken) {
      headers["X-Shopify-Storefront-Access-Token"] = config.storefrontToken;
    }

    const query = `
      query debugStorefront {
        products(first: 10) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
        collections(first: 10) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      return res.status(200).json({
        connected: false,
        productsFound: 0,
        collectionsFound: 0,
        sampleProducts: [],
        sampleCollections: [],
        error: `Storefront API returned HTTP ${response.status}`,
      });
    }

    const data = await response.json();
    if (data.errors && data.errors.length > 0) {
      return res.status(200).json({
        connected: false,
        productsFound: 0,
        collectionsFound: 0,
        sampleProducts: [],
        sampleCollections: [],
        error: data.errors[0]?.message || "GraphQL Error",
      });
    }

    const productEdges = data.data?.products?.edges || [];
    const collectionEdges = data.data?.collections?.edges || [];

    const sampleProducts = productEdges.map((e: any) => ({
      title: e.node?.title || "",
      handle: e.node?.handle || "",
    }));

    const sampleCollections = collectionEdges.map((e: any) => ({
      title: e.node?.title || "",
      handle: e.node?.handle || "",
    }));

    return res.status(200).json({
      connected: true,
      productsFound: sampleProducts.length,
      collectionsFound: sampleCollections.length,
      sampleProducts,
      sampleCollections,
    });
  } catch (error: any) {
    return res.status(200).json({
      connected: false,
      productsFound: 0,
      collectionsFound: 0,
      sampleProducts: [],
      sampleCollections: [],
      error: error?.message || "Failed to query Storefront API",
    });
  }
}
