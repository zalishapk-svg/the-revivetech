import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getConfig,
  shopifyStorage,
  STABLE_ADMIN_API_VERSION,
  STABLE_STOREFRONT_API_VERSION,
  checkFirebaseAdminHealth,
  checkShopifyStorefrontHealth,
} from "./_lib/shopify-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = (req.query.path as string) || "";
  const rawUrl = req.url || "";

  // 1. Firebase Health Check
  if (path === "firebase" || rawUrl.includes("health/firebase")) {
    try {
      const health = await checkFirebaseAdminHealth();
      return res.status(200).json({
        status: health.connected ? "ok" : "unconfigured",
        firebase: {
          connected: health.connected,
          projectId: health.projectId || null,
          firestore: health.firestore,
        },
        error: health.error || null,
      });
    } catch (err: any) {
      return res.status(200).json({
        status: "error",
        firebase: {
          connected: false,
          firestore: false,
        },
        error: err?.message || "Unexpected error checking Firebase health",
      });
    }
  }

  // 2. Shopify Storefront Health Check
  if (path === "shopify-storefront" || (rawUrl.includes("health/") && rawUrl.includes("shopify-storefront"))) {
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

  // 3. Shopify Storefront Debug Diagnostic
  if (path.includes("debug") || rawUrl.includes("/debug/")) {
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

  // 4. Default / Basic Health Check
  try {
    const config = getConfig();
    const session = await shopifyStorage.getSession(config.storeDomain);

    return res.status(200).json({
      status: "ok",
      apiVersion: STABLE_ADMIN_API_VERSION,
      storeDomain: config.storeDomain,
      hasAdminToken: Boolean(session?.accessToken),
    });
  } catch (err: any) {
    return res.status(200).json({
      status: "degraded",
      apiVersion: STABLE_ADMIN_API_VERSION,
      storeDomain: "dbbys1-nd.myshopify.com",
      hasAdminToken: false,
      error: err?.message || "Health check exception",
    });
  }
}
