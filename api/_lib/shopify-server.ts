import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Centralized Shopify API Versions (Current Stable Release: 2026-07)
export const STABLE_ADMIN_API_VERSION = "2026-07";
export const STABLE_STOREFRONT_API_VERSION = "2026-07";

// Exact required Admin API scopes based on functional analysis
export const REQUIRED_ADMIN_SCOPES = [
  "read_products",
  "write_products",
  "read_inventory",
  "write_inventory",
  "read_orders",
  "write_orders",
  "read_customers",
  "write_customers",
  "read_locations",
  "read_fulfillments",
  "write_fulfillments",
  "read_draft_orders",
  "write_draft_orders",
  "read_shipping",
  "write_shipping",
];

// Session Data Structure for Shopify OAuth
export interface ShopifySessionRecord {
  shop: string;
  accessToken: string;
  scope: string;
  installedAt: string;
  updatedAt: string;
  expiresAt?: number;
  isOnline: boolean;
}

/**
 * Initialize Firebase Admin SDK for Server-Side Firestore Access
 */
function getFirestoreDb(): Firestore | null {
  if (!getApps().length) {
    try {
      const serviceAccountStr =
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
        process.env.FIREBASE_SERVICE_ACCOUNT ||
        process.env.FIREBASE_CONFIG ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const projectId =
        process.env.FIREBASE_PROJECT_ID ||
        process.env.VITE_FIREBASE_PROJECT_ID ||
        process.env.GCP_PROJECT ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        "revivetech-32287";
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

      if (serviceAccountStr && serviceAccountStr.startsWith("{")) {
        let creds: any;
        try {
          creds = JSON.parse(serviceAccountStr);
        } catch {
          creds = serviceAccountStr;
        }
        initializeApp({
          credential: cert(creds),
        });
      } else if (clientEmail && privateKeyRaw && projectId) {
        const privateKey = privateKeyRaw.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else if (projectId) {
        initializeApp({ projectId });
      } else {
        return null;
      }
    } catch (err) {
      console.warn("[Firebase Admin Init] Server initialization note:", err);
      return null;
    }
  }

  try {
    if (!getApps().length) return null;
    return getFirestore();
  } catch (err) {
    console.warn("[Firebase Admin] Firestore instance unavailable:", err);
    return null;
  }
}

/**
 * Health check helper for Firebase Admin SDK and Firestore connection
 */
export async function checkFirebaseAdminHealth(): Promise<{ connected: boolean; projectId?: string; firestore: boolean; error?: string }> {
  try {
    const db = getFirestoreDb();
    if (!db) {
      return {
        connected: false,
        firestore: false,
        error: "Firebase Admin SDK unconfigured",
      };
    }
    // Attempt lightweight Firestore check
    await db.collection("shopify_tokens").doc("__health_check__").get();
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "configured";
    return {
      connected: true,
      projectId,
      firestore: true,
    };
  } catch (err: any) {
    return {
      connected: false,
      firestore: false,
      error: "Firestore operation failed or unconfigured",
    };
  }
}

/**
 * Health check helper for Shopify Storefront API connection
 */
export async function checkShopifyStorefrontHealth(): Promise<{ connected: boolean; storeDomain: string; apiVersion: string; error?: string }> {
  const config = getConfig();
  const domain = config.storeDomain || "dbbys1-nd.myshopify.com";
  const apiVersion = STABLE_STOREFRONT_API_VERSION;
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (config.storefrontToken) {
    headers["X-Shopify-Storefront-Access-Token"] = config.storefrontToken;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: `{ shop { name description } }`,
      }),
    });

    if (!res.ok) {
      let msg = `Storefront API returned HTTP ${res.status}`;
      if (res.status === 401 || res.status === 403) {
        msg = "Storefront Access Token required or invalid permissions on Shopify";
      }
      return {
        connected: false,
        storeDomain: domain,
        apiVersion,
        error: msg,
      };
    }

    const data = await res.json();
    if (data.errors && data.errors.length > 0) {
      return {
        connected: false,
        storeDomain: domain,
        apiVersion,
        error: data.errors[0]?.message || "GraphQL Storefront Error",
      };
    }

    if (data.data?.shop) {
      return {
        connected: true,
        storeDomain: domain,
        apiVersion,
      };
    }

    return {
      connected: false,
      storeDomain: domain,
      apiVersion,
      error: "Unexpected response format from Storefront API",
    };
  } catch (err: any) {
    return {
      connected: false,
      storeDomain: domain,
      apiVersion,
      error: err?.message || "Failed to connect to Shopify Storefront API",
    };
  }
}

/**
 * Serverless-Ready Shopify Session & Token Storage backed by Firebase Firestore
 * ----------------------------------------------------------------------------
 * Automatically manages Admin API access tokens using Shopify's Client Credentials / OAuth flow
 * (SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET) and caches them in Firestore collection "shopify_tokens".
 */
class ShopifyDatabaseSessionStorage {
  private inMemorySessions: Map<string, ShopifySessionRecord> = new Map();
  private inFlightPromises: Map<string, Promise<ShopifySessionRecord | null>> = new Map();

  public cleanDomain(domain?: string): string {
    const raw =
      domain ||
      process.env.SHOPIFY_SHOP ||
      process.env.SHOPIFY_STORE_DOMAIN ||
      process.env.SHOPIFY_DOMAIN ||
      process.env.VITE_SHOPIFY_STORE_DOMAIN ||
      "dbbys1-nd.myshopify.com";
    return raw.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  public async getSession(shopDomain?: string): Promise<ShopifySessionRecord | null> {
    const key = this.cleanDomain(shopDomain);

    // 1. Check in-memory cache first
    if (this.inMemorySessions.has(key)) {
      const session = this.inMemorySessions.get(key)!;
      if (!session.expiresAt || session.expiresAt > Date.now() + 60000) {
        return session;
      }
    }

    // 2. Check Firebase Firestore (collections: "shopify_tokens", "shopify_sessions", "sessions", "shopify_auth")
    const db = getFirestoreDb();
    if (db) {
      const collectionNames = ["shopify_tokens", "shopify_sessions", "sessions", "shopify_auth"];
      const docKeys = [
        key,
        `offline_${key}`,
        key.replace(".myshopify.com", ""),
        `offline_${key.replace(".myshopify.com", "")}`,
        "default",
        "active",
      ];

      for (const col of collectionNames) {
        for (const dKey of docKeys) {
          try {
            const snap = await db.collection(col).doc(dKey).get();
            if (snap.exists) {
              const data = snap.data();
              const foundToken =
                data?.accessToken ||
                data?.access_token ||
                data?.token ||
                data?.admin_token ||
                data?.session?.accessToken ||
                data?.session?.access_token;

              if (foundToken) {
                const record: ShopifySessionRecord = {
                  shop: data.shop || key,
                  accessToken: foundToken,
                  scope: data.scope || REQUIRED_ADMIN_SCOPES.join(","),
                  installedAt: data.installedAt || new Date().toISOString(),
                  updatedAt: data.updatedAt || new Date().toISOString(),
                  expiresAt: data.expiresAt || data.expires_at || undefined,
                  isOnline: false,
                };
                this.inMemorySessions.set(key, record);
                if (!record.expiresAt || record.expiresAt > Date.now() + 60000) {
                  return record;
                }
              }
            }
          } catch (e) {
            // continue checking other paths
          }
        }
      }
    }

    return null;
  }

  /**
   * Request Admin Access Token via Client Credentials Grant with request deduplication
   */
  public async fetchTokenViaClientCredentials(shopDomain?: string): Promise<ShopifySessionRecord | null> {
    const key = this.cleanDomain(shopDomain);

    if (this.inFlightPromises.has(key)) {
      return this.inFlightPromises.get(key)!;
    }

    const fetchPromise = (async () => {
      const clientId = (
        process.env.SHOPIFY_CLIENT_ID ||
        process.env.SHOPIFY_API_KEY ||
        process.env.SHOPIFY_APP_CLIENT_ID ||
        process.env.SHOPIFY_API_KEY_ID ||
        process.env.SHOPIFY_KEY ||
        process.env.VITE_SHOPIFY_CLIENT_ID ||
        ""
      ).trim();

      const clientSecret = (
        process.env.SHOPIFY_CLIENT_SECRET ||
        process.env.SHOPIFY_API_SECRET ||
        process.env.SHOPIFY_APP_CLIENT_SECRET ||
        process.env.SHOPIFY_SECRET ||
        process.env.SHOPIFY_SECRET_KEY ||
        process.env.VITE_SHOPIFY_CLIENT_SECRET ||
        ""
      ).trim();

      if (!clientId || !clientSecret) {
        console.warn("[Shopify Client Credentials] Missing SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET.");
        return null;
      }

      const tokenEndpoint = `https://${key}/admin/oauth/access_token`;

      // 1. Try JSON body grant
      try {
        console.log(`[Shopify Client Credentials] Requesting Admin API access token for ${key}...`);

        let response = await fetch(tokenEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "client_credentials",
          }),
        });

        // 2. If JSON not accepted, try urlencoded
        if (!response.ok) {
          const params = new URLSearchParams();
          params.append("client_id", clientId);
          params.append("client_secret", clientSecret);
          params.append("grant_type", "client_credentials");

          response = await fetch(tokenEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
            body: params.toString(),
          });
        }

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[Shopify Client Credentials Notice] Status: ${response.status} | Response: ${errText}`);
          return null;
        }

        const data = await response.json();
        const token = data.access_token || data.token;
        if (!token) {
          return null;
        }

        const expiresInSec = data.expires_in || 86400;
        const expiresAt = Date.now() + (expiresInSec - 300) * 1000;

        const record: ShopifySessionRecord = {
          shop: key,
          accessToken: token,
          scope: data.scope || REQUIRED_ADMIN_SCOPES.join(","),
          installedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiresAt,
          isOnline: false,
        };

        this.inMemorySessions.set(key, record);

        // Save fresh token to Firestore (shopify_tokens)
        const db = getFirestoreDb();
        if (db) {
          try {
            await db.collection("shopify_tokens").doc(key).set(
              {
                shop: key,
                accessToken: record.accessToken,
                scope: record.scope,
                installedAt: record.installedAt,
                updatedAt: record.updatedAt,
                expiresAt: record.expiresAt || null,
              },
              { merge: true }
            );
            console.log(`[Shopify Storage] Token saved to Firestore (collection: "shopify_tokens", doc: "${key}")`);
          } catch (err) {
            console.error("[Shopify Storage] Failed writing token to Firestore:", err);
          }
        }

        return record;
      } catch (err: any) {
        console.error("[Shopify Client Credentials Exception]", err);
        return null;
      } finally {
        this.inFlightPromises.delete(key);
      }
    })();

    this.inFlightPromises.set(key, fetchPromise);
    return fetchPromise;
  }

  public async getOrFetchAdminToken(shopDomain?: string, forceRefresh = false): Promise<string | null> {
    const key = this.cleanDomain(shopDomain);

    const envAdminToken = (
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_TOKEN ||
      process.env.SHOPIFY_ACCESS_TOKEN ||
      ""
    ).trim();

    if (!forceRefresh) {
      const session = await this.getSession(key);
      if (session?.accessToken) {
        return session.accessToken;
      }
      if (envAdminToken) {
        return envAdminToken;
      }
    } else {
      this.inMemorySessions.delete(key);
    }

    // Try Client Credentials Flow
    const newSession = await this.fetchTokenViaClientCredentials(key);
    if (newSession?.accessToken) {
      return newSession.accessToken;
    }

    if (envAdminToken) {
      return envAdminToken;
    }

    return null;
  }

  public async saveSession(shopDomain: string, accessToken: string, scope?: string): Promise<ShopifySessionRecord> {
    const key = this.cleanDomain(shopDomain);
    const now = new Date().toISOString();
    const existing = this.inMemorySessions.get(key);

    const record: ShopifySessionRecord = {
      shop: key,
      accessToken,
      scope: scope || REQUIRED_ADMIN_SCOPES.join(","),
      installedAt: existing?.installedAt || now,
      updatedAt: now,
      isOnline: false,
    };

    this.inMemorySessions.set(key, record);

    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection("shopify_tokens").doc(key).set(
          {
            shop: key,
            accessToken,
            scope: record.scope,
            installedAt: record.installedAt,
            updatedAt: record.updatedAt,
          },
          { merge: true }
        );
        console.log(`[Shopify Storage] Session token updated in Firestore for ${key}`);
      } catch (err) {
        console.error("[Shopify Storage] Failed writing updated session to Firestore:", err);
      }
    }

    return record;
  }

  public async deleteSession(shopDomain: string): Promise<void> {
    const key = this.cleanDomain(shopDomain);
    this.inMemorySessions.delete(key);

    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection("shopify_tokens").doc(key).delete();
      } catch (err) {
        console.error("[Shopify Storage] Failed purging session from Firestore:", err);
      }
    }
  }
}

export const shopifyStorage = new ShopifyDatabaseSessionStorage();

export function getConfig() {
  return {
    storeDomain: shopifyStorage.cleanDomain(
      process.env.SHOPIFY_SHOP ||
        process.env.SHOPIFY_STORE_DOMAIN ||
        process.env.SHOPIFY_DOMAIN ||
        process.env.VITE_SHOPIFY_STORE_DOMAIN ||
        "dbbys1-nd.myshopify.com"
    ),
    checkoutDomain: shopifyStorage.cleanDomain(
      process.env.SHOPIFY_CHECKOUT_DOMAIN ||
        process.env.VITE_SHOPIFY_CHECKOUT_DOMAIN ||
        process.env.SHOPIFY_SHOP ||
        process.env.SHOPIFY_STORE_DOMAIN ||
        "dbbys1-nd.myshopify.com"
    ),
    storefrontToken: (
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
      process.env.SHOPIFY_STOREFRONT_TOKEN ||
      process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
      ""
    ).trim(),
    clientId: (
      process.env.SHOPIFY_CLIENT_ID ||
      process.env.SHOPIFY_API_KEY ||
      process.env.SHOPIFY_APP_CLIENT_ID ||
      process.env.VITE_SHOPIFY_CLIENT_ID ||
      ""
    ).trim(),
    clientSecret: (
      process.env.SHOPIFY_CLIENT_SECRET ||
      process.env.SHOPIFY_API_SECRET ||
      process.env.SHOPIFY_APP_CLIENT_SECRET ||
      process.env.SHOPIFY_SECRET ||
      ""
    ).trim(),
    webhookSecret: (
      process.env.SHOPIFY_WEBHOOK_SECRET ||
      process.env.SHOPIFY_CLIENT_SECRET ||
      process.env.SHOPIFY_API_SECRET ||
      ""
    ).trim(),
    apiVersion: STABLE_ADMIN_API_VERSION,
  };
}

export function getAppBaseUrl(req: any): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const protocol = req.headers?.["x-forwarded-proto"] || "http";
  const host = req.headers?.["x-forwarded-host"] || req.headers?.host || "localhost:3000";
  return `${protocol}://${host}`;
}

export { getFirestoreDb };

// In-memory fallback for recent order confirmations
const recentOrdersMemoryCache = new Map<string, any>();

/**
 * Validates cart line items directly against Shopify Admin/Storefront API for authentic prices and inventory availability.
 */
export async function validateShopifyCartItems(
  items: Array<{ variantId: string | number; quantity: number }>,
  storeDomain?: string
): Promise<{
  valid: boolean;
  validatedItems: Array<{
    variantId: number;
    title: string;
    variantTitle?: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    sku?: string;
    availableForSale: boolean;
  }>;
  subtotal: number;
  error?: string;
}> {
  if (!items || !items.length) {
    return { valid: false, validatedItems: [], subtotal: 0, error: "Cart is empty." };
  }

  const domain = shopifyStorage.cleanDomain(storeDomain);
  const token = await shopifyStorage.getOrFetchAdminToken(domain);

  const validatedItems: Array<{
    variantId: number;
    title: string;
    variantTitle?: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    sku?: string;
    availableForSale: boolean;
  }> = [];

  let subtotal = 0;

  for (const item of items) {
    const rawIdStr = String(item.variantId || "");
    const numericVariantId = parseInt(rawIdStr.replace(/[^0-9]/g, ""), 10);
    const qty = Math.max(1, parseInt(String(item.quantity || 1), 10));

    if (!numericVariantId || isNaN(numericVariantId)) {
      return {
        valid: false,
        validatedItems: [],
        subtotal: 0,
        error: `Invalid product variant ID provided: ${item.variantId}`,
      };
    }

    if (token) {
      try {
        const variantEndpoint = `https://${domain}/admin/api/${STABLE_ADMIN_API_VERSION}/variants/${numericVariantId}.json`;
        const res = await fetch(variantEndpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Shopify-Access-Token": token,
          },
        });

        if (res.ok) {
          const vData = await res.json();
          const variant = vData?.variant;
          if (!variant) {
            return {
              valid: false,
              validatedItems: [],
              subtotal: 0,
              error: `Product variant #${numericVariantId} not found in Shopify catalog.`,
            };
          }

          if (variant.inventory_management && variant.inventory_policy === "deny") {
            const currentStock = variant.inventory_quantity ?? 0;
            if (currentStock < qty) {
              return {
                valid: false,
                validatedItems: [],
                subtotal: 0,
                error: `"${variant.title || "Selected item"}" is out of stock or requested quantity (${qty}) exceeds available stock (${currentStock}).`,
              };
            }
          }

          const livePrice = parseFloat(variant.price || "0");
          subtotal += livePrice * qty;

          validatedItems.push({
            variantId: numericVariantId,
            title: variant.name || variant.title || "Product",
            variantTitle: variant.title !== "Default Title" ? variant.title : undefined,
            price: livePrice,
            quantity: qty,
            sku: variant.sku || undefined,
            availableForSale: true,
          });
          continue;
        }
      } catch (err) {
        console.warn(`[Inventory Check] Admin API variant lookup error for #${numericVariantId}:`, err);
      }
    }

    // Fallback via Storefront GraphQL API
    try {
      const config = getConfig();
      const sfToken = config.storefrontToken;
      const gid = rawIdStr.startsWith("gid://") ? rawIdStr : `gid://shopify/ProductVariant/${numericVariantId}`;
      const sfEndpoint = `https://${domain}/api/${STABLE_STOREFRONT_API_VERSION}/graphql.json`;

      const sfRes = await fetch(sfEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sfToken ? { "X-Shopify-Storefront-Access-Token": sfToken } : {}),
        },
        body: JSON.stringify({
          query: `
            query getVariantNode($id: ID!) {
              node(id: $id) {
                ... on ProductVariant {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                  }
                  product {
                    title
                  }
                }
              }
            }
          `,
          variables: { id: gid },
        }),
      });

      if (sfRes.ok) {
        const sfData = await sfRes.json();
        const vNode = sfData?.data?.node;
        if (vNode) {
          if (!vNode.availableForSale) {
            return {
              valid: false,
              validatedItems: [],
              subtotal: 0,
              error: `"${vNode.product?.title || vNode.title}" is currently out of stock on Shopify.`,
            };
          }

          const livePrice = parseFloat(vNode.price?.amount || "0");
          subtotal += livePrice * qty;

          validatedItems.push({
            variantId: numericVariantId,
            title: vNode.product?.title || vNode.title || "Product",
            variantTitle: vNode.title !== "Default Title" ? vNode.title : undefined,
            price: livePrice,
            quantity: qty,
            imageUrl: vNode.image?.url,
            availableForSale: vNode.availableForSale,
          });
          continue;
        }
      }
    } catch (sfErr) {
      console.warn(`[Inventory Check] Storefront variant fallback error for #${numericVariantId}:`, sfErr);
    }

    return {
      valid: false,
      validatedItems: [],
      subtotal: 0,
      error: `Could not verify stock or pricing for variant #${numericVariantId} on Shopify.`,
    };
  }

  return {
    valid: true,
    validatedItems,
    subtotal,
  };
}

/**
 * Fetches real, live Shopify Shipping Delivery Rates directly from the Storefront API
 * based on the active store configuration in Shopify Settings -> Shipping and delivery.
 */
export async function fetchShopifyShippingRates(
  items?: Array<{ variantId: string | number; quantity: number }>,
  shippingAddress?: {
    address1?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  },
  storeDomain?: string
): Promise<Array<{
  id: string;
  title: string;
  price: number;
  currency: string;
  estimatedDays: string;
  description: string;
}>> {
  const config = getConfig();
  const domain = shopifyStorage.cleanDomain(storeDomain || config.storeDomain);
  const sfToken = config.storefrontToken;
  const sfEndpoint = `https://${domain}/api/${STABLE_STOREFRONT_API_VERSION}/graphql.json`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (sfToken) {
    headers["X-Shopify-Storefront-Access-Token"] = sfToken;
  }

  let lines: Array<{ merchandiseId: string; quantity: number }> = [];
  if (Array.isArray(items) && items.length > 0) {
    lines = items.map((it) => {
      const rawId = String(it.variantId || "");
      const gid = rawId.startsWith("gid://") ? rawId : `gid://shopify/ProductVariant/${rawId.replace(/[^0-9]/g, "")}`;
      return {
        merchandiseId: gid,
        quantity: Math.max(1, parseInt(String(it.quantity || 1), 10)),
      };
    });
  }

  // If no items were passed, query a product variant from the catalog
  if (lines.length === 0) {
    try {
      const productQuery = `
        query getSampleVariant {
          products(first: 1) {
            edges {
              node {
                variants(first: 1) {
                  edges {
                    node { id }
                  }
                }
              }
            }
          }
        }
      `;
      const pRes = await fetch(sfEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: productQuery }),
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        const sampleVariantId = pData.data?.products?.edges?.[0]?.node?.variants?.edges?.[0]?.node?.id;
        if (sampleVariantId) {
          lines = [{ merchandiseId: sampleVariantId, quantity: 1 }];
        }
      }
    } catch (e) {
      console.warn("[Shipping Rates] Could not fetch sample variant:", e);
    }
  }

  const addr = {
    address1: shippingAddress?.address1?.trim() || "Main Boulevard",
    city: shippingAddress?.city?.trim() || "Lahore",
    province: shippingAddress?.province?.trim() || "Punjab",
    country: shippingAddress?.country?.trim() || "PK",
    zip: shippingAddress?.postalCode?.trim() || "54000",
  };

  try {
    const cartMutation = `
      mutation createCartForDeliveryRates($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            cost {
              subtotalAmount { amount currencyCode }
              totalAmount { amount currencyCode }
            }
            deliveryGroups(first: 5) {
              edges {
                node {
                  id
                  deliveryOptions {
                    handle
                    title
                    description
                    estimatedCost {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lines,
        buyerIdentity: {
          deliveryAddressPreferences: [
            {
              deliveryAddress: addr,
            },
          ],
        },
      },
    };

    const res = await fetch(sfEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: cartMutation, variables }),
    });

    if (res.ok) {
      const data = await res.json();
      const cart = data.data?.cartCreate?.cart;
      const groups = cart?.deliveryGroups?.edges || [];

      const rates: Array<{
        id: string;
        title: string;
        price: number;
        currency: string;
        estimatedDays: string;
        description: string;
      }> = [];

      for (const group of groups) {
        const options = group.node?.deliveryOptions || [];
        for (const opt of options) {
          const priceNum = parseFloat(opt.estimatedCost?.amount || "0");
          const currencyCode = opt.estimatedCost?.currencyCode || "PKR";
          const title = opt.title || "Standard Delivery";
          const desc = opt.description || (priceNum === 0 ? "Free delivery as configured on Shopify" : "Shopify Verified Shipping");

          rates.push({
            id: opt.handle,
            title,
            price: priceNum,
            currency: currencyCode,
            estimatedDays: opt.description || "2-5 Business Days",
            description: desc,
          });
        }
      }

      if (rates.length > 0) {
        return rates;
      }
    }
  } catch (err) {
    console.error("[Shopify Shipping Rates Storefront Exception]:", err);
  }

  // 2. Fallback: Query Shopify Admin API Shipping Zones using server session
  try {
    const adminToken = await shopifyStorage.getOrFetchAdminToken(domain);
    if (adminToken) {
      const zoneEndpoint = `https://${domain}/admin/api/${STABLE_ADMIN_API_VERSION}/shipping_zones.json`;
      const zRes = await fetch(zoneEndpoint, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
      });

      if (zRes.ok) {
        const zData = await zRes.json();
        const zones = zData?.shipping_zones || [];
        const zoneRates: Array<{
          id: string;
          title: string;
          price: number;
          currency: string;
          estimatedDays: string;
          description: string;
        }> = [];

        for (const zone of zones) {
          const countryMatch = !zone.countries || zone.countries.length === 0 || zone.countries.some(
            (c: any) => c.code === "PK" || c.name?.toLowerCase() === "pakistan"
          );

          if (countryMatch) {
            if (Array.isArray(zone.price_based_shipping_rates)) {
              for (const rate of zone.price_based_shipping_rates) {
                const pNum = parseFloat(rate.price || "0");
                zoneRates.push({
                  id: String(rate.id || rate.name).toLowerCase().replace(/[^a-z0-9]/g, "-"),
                  title: rate.name || "Standard Courier Delivery",
                  price: pNum,
                  currency: "PKR",
                  estimatedDays: pNum === 0 ? "2-4 Business Days (Free Shipping)" : "2-4 Business Days",
                  description: pNum === 0 ? "Free shipping configured in Shopify" : "Shopify Standard Delivery",
                });
              }
            }
          }
        }

        if (zoneRates.length > 0) {
          return zoneRates;
        }
      }
    }
  } catch (e) {
    console.warn("[Shipping Zones Lookup Note]", e);
  }

  // Standard delivery fallback if no custom rate rules matched
  return [
    {
      id: "standard",
      title: "Standard Courier Delivery",
      price: 250,
      currency: "PKR",
      estimatedDays: "2-4 Business Days",
      description: "Standard courier delivery across Pakistan",
    },
  ];
}

/**
 * Creates a real Shopify order via the Admin API using Cash on Delivery (COD).
 */
export async function createShopifyAdminOrder(orderPayload: {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address1: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  validatedItems: Array<{
    variantId: number;
    title: string;
    variantTitle?: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    sku?: string;
  }>;
  shippingMethod: {
    title: string;
    price: number;
    code?: string;
  };
  discountCode?: string;
  discountAmount?: number;
  notes?: string;
  storeDomain?: string;
  reqHost?: string;
}): Promise<{
  success: boolean;
  orderReference: string;
  orderNumber: string;
  shopifyOrderId?: number;
  totalPrice: number;
  currency: string;
  orderData?: any;
  error?: string;
}> {
  const domain = shopifyStorage.cleanDomain(orderPayload.storeDomain);
  let token = await shopifyStorage.getOrFetchAdminToken(domain);

  if (!token) {
    return {
      success: false,
      orderReference: "",
      orderNumber: "",
      totalPrice: 0,
      currency: "PKR",
      error: `Shopify server authentication error: Could not obtain Admin API access token for ${domain}. Please verify SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET.`,
    };
  }

  const { customer, shippingAddress, validatedItems, shippingMethod, discountCode, discountAmount = 0, notes } = orderPayload;

  const subtotal = validatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount + shippingMethod.price);

  const shopifyOrderPayload: any = {
    order: {
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      financial_status: "pending",
      fulfillment_status: null,
      send_receipt: true,
      send_fulfillment_receipt: true,
      gateway: "Cash on Delivery (COD)",
      payment_gateway_names: ["Cash on Delivery (COD)"],
      note: notes ? `Payment: Cash on Delivery (COD)\nCustomer Notes: ${notes}` : "Payment: Cash on Delivery (COD)",
      tags: "COD, Headless Checkout, ReviveTech Storefront",
      line_items: validatedItems.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        price: item.price.toFixed(2),
      })),
      customer: {
        first_name: customer.firstName.trim(),
        last_name: customer.lastName.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
      billing_address: {
        first_name: customer.firstName.trim(),
        last_name: customer.lastName.trim(),
        address1: shippingAddress.address1.trim(),
        city: shippingAddress.city.trim(),
        province: shippingAddress.province.trim(),
        zip: shippingAddress.postalCode.trim(),
        country: shippingAddress.country || "Pakistan",
        phone: customer.phone.trim(),
      },
      shipping_address: {
        first_name: customer.firstName.trim(),
        last_name: customer.lastName.trim(),
        address1: shippingAddress.address1.trim(),
        city: shippingAddress.city.trim(),
        province: shippingAddress.province.trim(),
        zip: shippingAddress.postalCode.trim(),
        country: shippingAddress.country || "Pakistan",
        phone: customer.phone.trim(),
      },
      shipping_lines: [
        {
          title: shippingMethod.title,
          price: shippingMethod.price.toFixed(2),
          code: shippingMethod.code || "STANDARD",
        },
      ],
    },
  };

  if (discountAmount > 0 && discountCode) {
    shopifyOrderPayload.order.discount_codes = [
      {
        code: discountCode.toUpperCase(),
        amount: discountAmount.toFixed(2),
        type: "fixed_amount",
      },
    ];
  }

  const endpoint = `https://${domain}/admin/api/${STABLE_ADMIN_API_VERSION}/orders.json`;

  let res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify(shopifyOrderPayload),
  });

  // Handle 401 Unauthorized token retry
  if (res.status === 401) {
    console.warn("[Shopify Order Create] Received 401 Unauthorized. Refreshing token and retrying...");
    token = await shopifyStorage.getOrFetchAdminToken(domain, true);
    if (token) {
      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify(shopifyOrderPayload),
      });
    }
  }

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[Shopify Order Create Error] HTTP ${res.status}:`, errorBody);
    let parsedMsg = "Shopify order creation failed.";
    try {
      const errJson = JSON.parse(errorBody);
      if (errJson.errors) {
        if (typeof errJson.errors === "string") parsedMsg = errJson.errors;
        else parsedMsg = JSON.stringify(errJson.errors);
      }
    } catch {}
    return {
      success: false,
      orderReference: "",
      orderNumber: "",
      totalPrice: 0,
      currency: "PKR",
      error: parsedMsg,
    };
  }

  const resData = await res.json();
  const createdOrder = resData?.order;

  if (!createdOrder || !createdOrder.id) {
    return {
      success: false,
      orderReference: "",
      orderNumber: "",
      totalPrice: 0,
      currency: "PKR",
      error: "Unexpected response from Shopify Admin API.",
    };
  }

  const orderNumber = createdOrder.name || `#${createdOrder.order_number}`;
  const orderReference = `RT-${createdOrder.order_number || createdOrder.id}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const orderConfirmationData = {
    orderReference,
    orderNumber,
    shopifyOrderId: createdOrder.id,
    createdAt: createdOrder.created_at || new Date().toISOString(),
    customer: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
    },
    shippingAddress: {
      address1: shippingAddress.address1,
      city: shippingAddress.city,
      province: shippingAddress.province,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country || "Pakistan",
    },
    items: validatedItems.map((it) => ({
      id: String(it.variantId),
      title: it.title,
      variantTitle: it.variantTitle,
      quantity: it.quantity,
      price: it.price,
      imageUrl: it.imageUrl,
    })),
    shippingLine: {
      title: shippingMethod.title,
      price: shippingMethod.price,
    },
    subtotal,
    discount: discountAmount,
    discountCode: discountAmount > 0 ? discountCode : undefined,
    total: parseFloat(createdOrder.total_price || total.toFixed(2)),
    currency: createdOrder.currency || "PKR",
    paymentMethod: "Cash on Delivery (COD)",
    financialStatus: createdOrder.financial_status || "pending",
    notes: notes || undefined,
  };

  // Cache in Firestore under "shopify_orders"
  const db = getFirestoreDb();
  if (db) {
    try {
      await db.collection("shopify_orders").doc(orderReference).set(orderConfirmationData);
      console.log(`[Firestore Order Saved] Cached order reference ${orderReference} in Firestore.`);
    } catch (fsErr) {
      console.warn("[Firestore Order Save Warning]", fsErr);
    }
  }

  // Also cache in memory for fast lookup
  recentOrdersMemoryCache.set(orderReference, orderConfirmationData);
  recentOrdersMemoryCache.set(orderNumber.replace("#", ""), orderConfirmationData);

  return {
    success: true,
    orderReference,
    orderNumber,
    shopifyOrderId: createdOrder.id,
    totalPrice: orderConfirmationData.total,
    currency: orderConfirmationData.currency,
    orderData: orderConfirmationData,
  };
}

/**
 * Retrieves cached order confirmation details by reference.
 */
export async function getOrderConfirmationRecord(reference: string): Promise<any | null> {
  const cleanRef = reference.trim();
  if (!cleanRef) return null;

  if (recentOrdersMemoryCache.has(cleanRef)) {
    return recentOrdersMemoryCache.get(cleanRef);
  }

  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await db.collection("shopify_orders").doc(cleanRef).get();
      if (snap.exists) {
        const data = snap.data();
        recentOrdersMemoryCache.set(cleanRef, data);
        return data;
      }
    } catch (e) {
      console.warn(`[Order Lookup] Firestore lookup error for ${cleanRef}:`, e);
    }
  }

  return null;
}

export interface OrderTrackingLineItem {
  id: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface OrderTrackingFulfillment {
  id: string;
  createdAt: string;
  updatedAt?: string | null;
  status: string;
  displayStatus?: string;
  company?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryAt?: string | null;
  lineItems?: Array<{
    title: string;
    variantTitle?: string;
    quantity: number;
  }>;
}

export interface OrderTrackingTimelineStep {
  stage: "placed" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  title: string;
  description: string;
  timestamp?: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface OrderTrackingInfo {
  orderNumber: string;
  orderReference?: string;
  shopifyOrderId: string;
  createdAt: string;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  financialStatus: string;
  fulfillmentStatus: string;
  currency: string;
  totalAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  itemCount: number;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    name?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
  };
  shippingMethod?: {
    title: string;
    price?: number;
  };
  paymentMethod: string;
  lineItems: OrderTrackingLineItem[];
  fulfillments: OrderTrackingFulfillment[];
  timeline: OrderTrackingTimelineStep[];
}

export interface OrderTrackingResult {
  success: boolean;
  order?: OrderTrackingInfo;
  error?: string;
}

/**
 * Robust, secure server-side order lookup by Order Number and Email.
 * Verifies email ownership and fetches real-time Shopify fulfillment details.
 */
export async function trackShopifyOrder(
  orderNumberInput: string,
  emailInput: string,
  storeDomain?: string
): Promise<OrderTrackingResult> {
  const rawNumber = (orderNumberInput || "").trim();
  const rawEmail = (emailInput || "").trim().toLowerCase();

  if (!rawNumber || !rawEmail) {
    return {
      success: false,
      error: "Please provide both an Order Number and the Email Address used at checkout.",
    };
  }

  // Basic email pattern check
  if (!rawEmail.includes("@") || !rawEmail.includes(".")) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  const cleanNumber = rawNumber.replace(/^#+/, "").trim();
  const formattedWithHash = `#${cleanNumber}`;
  const config = getConfig();
  const domain = storeDomain || config.storeDomain || "dbbys1-nd.myshopify.com";

  console.log(`[Order Tracking] Looking up order: '${rawNumber}' (clean: '${cleanNumber}') for email: '${rawEmail}'`);

  let foundOrderNode: any = null;

  // 1. Try Shopify Admin GraphQL Query
  try {
    let token = await shopifyStorage.getOrFetchAdminToken(domain);
    if (token) {
      const graphqlQuery = `
        query getOrderForTracking($query: String!) {
          orders(first: 10, query: $query) {
            edges {
              node {
                id
                name
                createdAt
                cancelledAt
                cancelReason
                displayFinancialStatus
                displayFulfillmentStatus
                currencyCode
                note
                email
                phone
                currentTotalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                currentSubtotalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                currentTotalDiscountsSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                totalShippingPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                totalTaxSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                customer {
                  firstName
                  lastName
                  email
                  phone
                }
                shippingAddress {
                  firstName
                  lastName
                  address1
                  address2
                  city
                  province
                  zip
                  country
                }
                shippingLine {
                  title
                  originalPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                }
                lineItems(first: 50) {
                  edges {
                    node {
                      id
                      title
                      variantTitle
                      quantity
                      originalUnitPriceSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                      discountedUnitPriceSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                      originalTotalSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                      image {
                        url
                        altText
                      }
                      variant {
                        id
                        title
                        image {
                          url
                        }
                      }
                    }
                  }
                }
                fulfillments {
                  id
                  createdAt
                  updatedAt
                  status
                  displayStatus
                  estimatedDeliveryAt
                  trackingInfo {
                    company
                    number
                    url
                  }
                  fulfillmentLineItems(first: 50) {
                    edges {
                      node {
                        quantity
                        lineItem {
                          id
                          title
                          variantTitle
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      // Query Shopify Admin GraphQL by order name, number, or customer email
      const searchTerms = `name:${cleanNumber} OR name:${formattedWithHash} OR email:${rawEmail} OR ${cleanNumber}`;
      const endpoint = `https://${domain}/admin/api/${STABLE_ADMIN_API_VERSION}/graphql.json`;

      let res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { query: searchTerms },
        }),
      });

      if (res.status === 401) {
        token = await shopifyStorage.getOrFetchAdminToken(domain, true);
        if (token) {
          res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-Shopify-Access-Token": token,
            },
            body: JSON.stringify({
              query: graphqlQuery,
              variables: { query: searchTerms },
            }),
          });
        }
      }

      if (res.ok) {
        const json = await res.json();
        const edges = json?.data?.orders?.edges || [];
        for (const edge of edges) {
          const node = edge.node;
          const nodeName = (node.name || "").trim().toLowerCase();
          const nodeClean = nodeName.replace(/^#+/, "");
          const nodeId = String(node.id || "");
          const matchNumber =
            nodeName === rawNumber.toLowerCase() ||
            nodeName === formattedWithHash.toLowerCase() ||
            nodeClean === cleanNumber.toLowerCase() ||
            nodeId.endsWith(`/${cleanNumber}`) ||
            nodeName.endsWith(cleanNumber.toLowerCase());

          if (matchNumber) {
            // Verify email match
            const orderEmail = (node.email || "").trim().toLowerCase();
            const customerEmail = (node.customer?.email || "").trim().toLowerCase();
            if (orderEmail === rawEmail || customerEmail === rawEmail) {
              foundOrderNode = { source: "graphql", data: node };
              break;
            }
          }
        }
      }
    }
  } catch (gqlErr) {
    console.warn("[Order Tracking] Admin GraphQL query exception:", gqlErr);
  }

  // 2. If not found yet, try REST Admin API
  if (!foundOrderNode) {
    try {
      const token = await shopifyStorage.getOrFetchAdminToken(domain);
      if (token) {
        const restUrls = [
          `https://${domain}/admin/api/${STABLE_ADMIN_API_VERSION}/orders.json?name=${encodeURIComponent(
            formattedWithHash
          )}&status=any`,
          `https://${domain}/admin/api/${STABLE_ADMIN_API_VERSION}/orders.json?name=${encodeURIComponent(
            cleanNumber
          )}&status=any`,
          `https://${domain}/admin/api/${STABLE_ADMIN_API_VERSION}/orders.json?query=email:${encodeURIComponent(
            rawEmail
          )}&status=any`,
          `https://${domain}/admin/api/${STABLE_ADMIN_API_VERSION}/orders.json?query=${encodeURIComponent(
            cleanNumber
          )}&status=any`,
        ];

        for (const url of restUrls) {
          const restRes = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": token,
            },
          });

          if (restRes.ok) {
            const restData = await restRes.json();
            const orders = restData?.orders || [];
            for (const ord of orders) {
              const ordName = (ord.name || "").trim().toLowerCase();
              const ordClean = ordName.replace(/^#+/, "");
              const ordNumber = String(ord.order_number || "");
              const matchNumber =
                ordName === rawNumber.toLowerCase() ||
                ordName === formattedWithHash.toLowerCase() ||
                ordClean === cleanNumber.toLowerCase() ||
                ordNumber === cleanNumber ||
                ordName.endsWith(cleanNumber.toLowerCase());

              if (matchNumber) {
                const orderEmail = (ord.email || ord.contact_email || "").trim().toLowerCase();
                const customerEmail = (ord.customer?.email || "").trim().toLowerCase();
                if (orderEmail === rawEmail || customerEmail === rawEmail) {
                  foundOrderNode = { source: "rest", data: ord };
                  break;
                }
              }
            }
          }
          if (foundOrderNode) break;
        }
      }
    } catch (restErr) {
      console.warn("[Order Tracking] REST lookup error:", restErr);
    }
  }

  // 3. If not found in live Shopify, check Firestore Cached Orders (e.g. from headless checkout)
  if (!foundOrderNode) {
    try {
      const db = getFirestoreDb();
      if (db) {
        const refsToTry = [cleanNumber, formattedWithHash, rawNumber];
        for (const r of refsToTry) {
          const snap = await db.collection("shopify_orders").doc(r).get();
          if (snap.exists) {
            const data = snap.data();
            const orderEmail = (data?.customer?.email || "").trim().toLowerCase();
            if (orderEmail === rawEmail) {
              foundOrderNode = { source: "firestore", data };
              break;
            }
          }
        }

        if (!foundOrderNode) {
          // Query by orderNumber field
          const qSnap = await db
            .collection("shopify_orders")
            .where("customer.email", "==", rawEmail)
            .limit(10)
            .get();

          qSnap.forEach((doc) => {
            const data = doc.data();
            const ordNum = (data?.orderNumber || "").trim().toLowerCase();
            const ordClean = ordNum.replace(/^#+/, "");
            const ordRef = (data?.orderReference || "").trim().toLowerCase();
            if (
              ordNum === formattedWithHash.toLowerCase() ||
              ordClean === cleanNumber.toLowerCase() ||
              ordRef === rawNumber.toLowerCase() ||
              ordNum === rawNumber.toLowerCase() ||
              ordNum.endsWith(cleanNumber.toLowerCase())
            ) {
              foundOrderNode = { source: "firestore", data };
            }
          });
        }
      }
    } catch (fsErr) {
      console.warn("[Order Tracking] Firestore lookup error:", fsErr);
    }
  }

  // 4. Also check Memory Cache
  if (!foundOrderNode) {
    const memoryKeys = [rawNumber, cleanNumber, formattedWithHash];
    for (const key of memoryKeys) {
      if (recentOrdersMemoryCache.has(key)) {
        const cached = recentOrdersMemoryCache.get(key);
        if (cached?.customer?.email?.trim().toLowerCase() === rawEmail) {
          foundOrderNode = { source: "firestore", data: cached };
          break;
        }
      }
    }
  }

  // If no order matched BOTH the order number and email address:
  if (!foundOrderNode) {
    return {
      success: false,
      error:
        "We couldn't find an order matching those details. Please check your order number and email address and try again.",
    };
  }

  // Format the matched order based on source
  try {
    const info = buildOrderTrackingInfo(foundOrderNode);
    return {
      success: true,
      order: info,
    };
  } catch (formatErr: any) {
    console.error("[Order Tracking] Formatting error:", formatErr);
    return {
      success: false,
      error: "Something went wrong while checking your order. Please try again in a moment.",
    };
  }
}

/**
 * Normalizes disparate Shopify data shapes (GraphQL, REST, Firestore) into a consistent OrderTrackingInfo payload.
 */
function buildOrderTrackingInfo(found: { source: string; data: any }): OrderTrackingInfo {
  const { source, data } = found;

  if (source === "graphql") {
    const totalAmount = parseFloat(data.currentTotalPriceSet?.shopMoney?.amount || "0");
    const subtotalAmount = parseFloat(data.currentSubtotalPriceSet?.shopMoney?.amount || "0");
    const discountAmount = parseFloat(data.currentTotalDiscountsSet?.shopMoney?.amount || "0");
    const shippingAmount = parseFloat(data.totalShippingPriceSet?.shopMoney?.amount || "0");
    const taxAmount = parseFloat(data.totalTaxSet?.shopMoney?.amount || "0");
    const currency = data.currencyCode || data.currentTotalPriceSet?.shopMoney?.currencyCode || "PKR";

    const lineItems: OrderTrackingLineItem[] = (data.lineItems?.edges || []).map((edge: any) => {
      const item = edge.node;
      const unitPrice = parseFloat(
        item.discountedUnitPriceSet?.shopMoney?.amount ||
          item.originalUnitPriceSet?.shopMoney?.amount ||
          "0"
      );
      const itemTotal = parseFloat(
        item.originalTotalSet?.shopMoney?.amount || (unitPrice * (item.quantity || 1)).toFixed(2)
      );
      const imgUrl = item.image?.url || item.variant?.image?.url || undefined;
      return {
        id: item.id || `item-${Math.random()}`,
        title: item.title,
        variantTitle: item.variantTitle && item.variantTitle !== "Default Title" ? item.variantTitle : undefined,
        quantity: item.quantity || 1,
        unitPrice,
        totalPrice: itemTotal,
        imageUrl: imgUrl,
      };
    });

    const fulfillments: OrderTrackingFulfillment[] = (data.fulfillments || []).map((f: any) => {
      const tracking = f.trackingInfo?.[0] || {};
      const fLineItems = (f.fulfillmentLineItems?.edges || []).map((fl: any) => ({
        title: fl.node?.lineItem?.title || "Item",
        variantTitle: fl.node?.lineItem?.variantTitle,
        quantity: fl.node?.quantity || 1,
      }));

      return {
        id: f.id,
        createdAt: f.createdAt,
        status: f.status || "SUCCESS",
        displayStatus: f.displayStatus || undefined,
        company: tracking.company || undefined,
        trackingNumber: tracking.number || undefined,
        trackingUrl: tracking.url || undefined,
        estimatedDeliveryAt: f.estimatedDeliveryAt || null,
        lineItems: fLineItems.length > 0 ? fLineItems : undefined,
      };
    });

    const finStatus = (data.displayFinancialStatus || "PAID").toUpperCase();
    const fulStatus = (data.displayFulfillmentStatus || "UNFULFILLED").toUpperCase();

    const timeline = generateOrderTimeline({
      createdAt: data.createdAt,
      cancelledAt: data.cancelledAt,
      cancelReason: data.cancelReason,
      financialStatus: finStatus,
      fulfillmentStatus: fulStatus,
      fulfillments,
    });

    return {
      orderNumber: data.name || "#0000",
      shopifyOrderId: data.id,
      createdAt: data.createdAt,
      cancelledAt: data.cancelledAt || null,
      cancelReason: data.cancelReason || null,
      financialStatus: finStatus,
      fulfillmentStatus: fulStatus,
      currency,
      totalAmount,
      subtotalAmount: subtotalAmount > 0 ? subtotalAmount : totalAmount,
      discountAmount,
      shippingAmount,
      taxAmount,
      itemCount: lineItems.reduce((acc, i) => acc + i.quantity, 0),
      customer: {
        name: `${data.customer?.firstName || data.shippingAddress?.firstName || "Valued"} ${
          data.customer?.lastName || data.shippingAddress?.lastName || "Customer"
        }`.trim(),
        email: data.email || data.customer?.email || "",
        phone: data.phone || data.customer?.phone || data.shippingAddress?.phone || undefined,
      },
      shippingAddress: {
        name: `${data.shippingAddress?.firstName || ""} ${data.shippingAddress?.lastName || ""}`.trim() || undefined,
        address1: data.shippingAddress?.address1 || "Delivery address on file",
        address2: data.shippingAddress?.address2 || undefined,
        city: data.shippingAddress?.city || "Lahore",
        province: data.shippingAddress?.province || "Punjab",
        country: data.shippingAddress?.country || "Pakistan",
        postalCode: data.shippingAddress?.zip || "00000",
      },
      shippingMethod: {
        title: data.shippingLine?.title || "Standard Express Courier PK",
        price: shippingAmount,
      },
      paymentMethod: "Cash on Delivery (COD)",
      lineItems,
      fulfillments,
      timeline,
    };
  }

  if (source === "rest") {
    const totalAmount = parseFloat(data.total_price || "0");
    const subtotalAmount = parseFloat(data.subtotal_price || "0");
    const discountAmount = parseFloat(data.total_discounts || "0");
    const shippingAmount = parseFloat(data.total_shipping_price_set?.shop_money?.amount || data.shipping_lines?.[0]?.price || "0");
    const taxAmount = parseFloat(data.total_tax || "0");
    const currency = data.currency || "PKR";

    const lineItems: OrderTrackingLineItem[] = (data.line_items || []).map((item: any) => {
      const unitPrice = parseFloat(item.price || "0");
      const quantity = item.quantity || 1;
      return {
        id: String(item.id),
        title: item.title || item.name,
        variantTitle: item.variant_title && item.variant_title !== "Default Title" ? item.variant_title : undefined,
        quantity,
        unitPrice,
        totalPrice: parseFloat((unitPrice * quantity).toFixed(2)),
        imageUrl: item.image?.src || undefined,
      };
    });

    const fulfillments: OrderTrackingFulfillment[] = (data.fulfillments || []).map((f: any) => ({
      id: String(f.id),
      createdAt: f.created_at,
      status: (f.status || "success").toUpperCase(),
      displayStatus: f.shipment_status ? f.shipment_status.toUpperCase() : undefined,
      company: f.tracking_company || undefined,
      trackingNumber: f.tracking_number || undefined,
      trackingUrl: f.tracking_url || undefined,
      estimatedDeliveryAt: f.estimated_delivery_at || null,
      lineItems: (f.line_items || []).map((fli: any) => ({
        title: fli.title,
        variantTitle: fli.variant_title,
        quantity: fli.quantity,
      })),
    }));

    const finStatus = (data.financial_status || "paid").toUpperCase();
    const fulStatus = (data.fulfillment_status || "unfulfilled").toUpperCase();

    const timeline = generateOrderTimeline({
      createdAt: data.created_at,
      cancelledAt: data.cancelled_at,
      cancelReason: data.cancel_reason,
      financialStatus: finStatus,
      fulfillmentStatus: fulStatus,
      fulfillments,
    });

    return {
      orderNumber: data.name || `#${data.order_number}`,
      shopifyOrderId: String(data.id),
      createdAt: data.created_at,
      cancelledAt: data.cancelled_at || null,
      cancelReason: data.cancel_reason || null,
      financialStatus: finStatus,
      fulfillmentStatus: fulStatus,
      currency,
      totalAmount,
      subtotalAmount: subtotalAmount > 0 ? subtotalAmount : totalAmount,
      discountAmount,
      shippingAmount,
      taxAmount,
      itemCount: lineItems.reduce((acc, i) => acc + i.quantity, 0),
      customer: {
        name: `${data.customer?.first_name || data.shipping_address?.first_name || "Valued"} ${
          data.customer?.last_name || data.shipping_address?.last_name || "Customer"
        }`.trim(),
        email: data.email || data.customer?.email || "",
        phone: data.phone || data.customer?.phone || data.shipping_address?.phone || undefined,
      },
      shippingAddress: {
        name: `${data.shipping_address?.first_name || ""} ${data.shipping_address?.last_name || ""}`.trim() || undefined,
        address1: data.shipping_address?.address1 || "Delivery address on file",
        address2: data.shipping_address?.address2 || undefined,
        city: data.shipping_address?.city || "Lahore",
        province: data.shipping_address?.province || "Punjab",
        country: data.shipping_address?.country || "Pakistan",
        postalCode: data.shipping_address?.zip || "00000",
      },
      shippingMethod: {
        title: data.shipping_lines?.[0]?.title || "Standard Express Courier PK",
        price: shippingAmount,
      },
      paymentMethod: data.gateway ? data.gateway.toUpperCase() : "Cash on Delivery (COD)",
      lineItems,
      fulfillments,
      timeline,
    };
  }

  // Default / Firestore source
  const lineItems: OrderTrackingLineItem[] = (data.items || []).map((item: any) => ({
    id: item.id || `item-${Math.random()}`,
    title: item.title,
    variantTitle: item.variantTitle,
    quantity: item.quantity || 1,
    unitPrice: item.price || 0,
    totalPrice: (item.price || 0) * (item.quantity || 1),
    imageUrl: item.imageUrl,
  }));

  const finStatus = (data.financialStatus || "PENDING").toUpperCase();
  const fulStatus = (data.fulfillmentStatus || "UNFULFILLED").toUpperCase();

  const timeline = generateOrderTimeline({
    createdAt: data.createdAt,
    financialStatus: finStatus,
    fulfillmentStatus: fulStatus,
    fulfillments: [],
  });

  return {
    orderNumber: data.orderNumber || "#0000",
    orderReference: data.orderReference,
    shopifyOrderId: String(data.shopifyOrderId || data.orderReference || ""),
    createdAt: data.createdAt,
    financialStatus: finStatus,
    fulfillmentStatus: fulStatus,
    currency: data.currency || "PKR",
    totalAmount: data.total || 0,
    subtotalAmount: data.subtotal || data.total || 0,
    discountAmount: data.discount || 0,
    shippingAmount: data.shippingLine?.price || 0,
    taxAmount: 0,
    itemCount: lineItems.reduce((acc, i) => acc + i.quantity, 0),
    customer: {
      name: `${data.customer?.firstName || "Valued"} ${data.customer?.lastName || "Customer"}`.trim(),
      email: data.customer?.email || "",
      phone: data.customer?.phone,
    },
    shippingAddress: {
      address1: data.shippingAddress?.address1 || "Delivery address on file",
      city: data.shippingAddress?.city || "Lahore",
      province: data.shippingAddress?.province || "Punjab",
      country: data.shippingAddress?.country || "Pakistan",
      postalCode: data.shippingAddress?.postalCode || "00000",
    },
    shippingMethod: {
      title: data.shippingLine?.title || "Standard Delivery PK",
      price: data.shippingLine?.price || 0,
    },
    paymentMethod: data.paymentMethod || "Cash on Delivery (COD)",
    lineItems,
    fulfillments: [],
    timeline,
  };
}

/**
 * Builds chronological real-world timeline stages from Shopify order status & fulfillment events.
 */
function generateOrderTimeline(params: {
  createdAt: string;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  financialStatus: string;
  fulfillmentStatus: string;
  fulfillments?: OrderTrackingFulfillment[];
}): OrderTrackingTimelineStep[] {
  const { createdAt, cancelledAt, cancelReason, financialStatus, fulfillmentStatus, fulfillments = [] } = params;

  if (cancelledAt) {
    return [
      {
        stage: "placed",
        title: "Order Placed",
        description: "Your order was received and recorded in our store system.",
        timestamp: createdAt,
        isCompleted: true,
        isCurrent: false,
      },
      {
        stage: "cancelled",
        title: "Order Cancelled",
        description: cancelReason ? `Reason: ${cancelReason}` : "Order was cancelled.",
        timestamp: cancelledAt,
        isCompleted: true,
        isCurrent: true,
      },
    ];
  }

  const hasFulfillments = fulfillments.length > 0;
  const isFulfilled =
    fulfillmentStatus === "FULFILLED" ||
    fulfillmentStatus === "DELIVERED" ||
    fulfillmentStatus === "IN_TRANSIT" ||
    fulfillmentStatus === "OUT_FOR_DELIVERY";
  const isDelivered =
    fulfillmentStatus === "DELIVERED" ||
    fulfillments.some((f) => f.status === "DELIVERED" || f.displayStatus === "DELIVERED");

  const latestFulfillment = fulfillments[0];

  const steps: OrderTrackingTimelineStep[] = [
    {
      stage: "placed",
      title: "Order Placed",
      description: "Order received and queued for verification.",
      timestamp: createdAt,
      isCompleted: true,
      isCurrent: !isFulfilled && !hasFulfillments && financialStatus === "PENDING",
    },
    {
      stage: "confirmed",
      title: "Order Confirmed",
      description:
        financialStatus === "PAID"
          ? "Payment verified and order accepted."
          : "Order verified and authorized for warehouse processing.",
      timestamp: createdAt,
      isCompleted: true,
      isCurrent: !isFulfilled && !hasFulfillments && financialStatus !== "PENDING",
    },
    {
      stage: "processing",
      title: "Processing & Packaging",
      description: isFulfilled
        ? "Items were carefully inspected and packaged."
        : "Our warehouse team is preparing your hardware items for dispatch.",
      timestamp: null,
      isCompleted: isFulfilled || hasFulfillments,
      isCurrent: !isFulfilled && !hasFulfillments,
    },
    {
      stage: "shipped",
      title: "Dispatched & In Transit",
      description: latestFulfillment
        ? `Handed over to courier ${latestFulfillment.company ? `(${latestFulfillment.company})` : ""}.`
        : "Courier pickup and dispatch in progress.",
      timestamp: latestFulfillment?.createdAt || null,
      isCompleted: isFulfilled || hasFulfillments,
      isCurrent: (isFulfilled || hasFulfillments) && !isDelivered,
    },
    {
      stage: "delivered",
      title: "Delivered",
      description: isDelivered
        ? "Package successfully delivered to recipient."
        : "Delivery to your shipping address.",
      timestamp: isDelivered ? latestFulfillment?.updatedAt || null : null,
      isCompleted: isDelivered,
      isCurrent: isDelivered,
    },
  ];

  return steps;
}

