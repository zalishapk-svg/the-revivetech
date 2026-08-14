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

    // 2. Check Firebase Firestore (collection: "shopify_tokens", doc: key)
    const db = getFirestoreDb();
    if (db) {
      try {
        const docRef = db.collection("shopify_tokens").doc(key);
        const snap = await docRef.get();
        if (snap.exists) {
          const data = snap.data();
          if (data && data.accessToken) {
            const record: ShopifySessionRecord = {
              shop: data.shop || key,
              accessToken: data.accessToken,
              scope: data.scope || REQUIRED_ADMIN_SCOPES.join(","),
              installedAt: data.installedAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              expiresAt: data.expiresAt || undefined,
              isOnline: false,
            };
            this.inMemorySessions.set(key, record);
            if (!record.expiresAt || record.expiresAt > Date.now() + 60000) {
              return record;
            }
          }
        }
      } catch (e) {
        console.error("[Shopify Storage] Error fetching cached token from Firestore:", e);
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
        process.env.VITE_SHOPIFY_CLIENT_ID ||
        ""
      ).trim();

      const clientSecret = (
        process.env.SHOPIFY_CLIENT_SECRET ||
        process.env.SHOPIFY_API_SECRET ||
        process.env.SHOPIFY_APP_CLIENT_SECRET ||
        process.env.SHOPIFY_SECRET ||
        ""
      ).trim();

      if (!clientId || !clientSecret) {
        console.warn("[Shopify Client Credentials] Missing SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET.");
        return null;
      }

      try {
        console.log(`[Shopify Client Credentials] Requesting Admin API access token for ${key}...`);
        const tokenEndpoint = `https://${key}/admin/oauth/access_token`;

        const response = await fetch(tokenEndpoint, {
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

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[Shopify Client Credentials Notice] Status: ${response.status} | Response: ${errText}`);
          return null;
        }

        const data = await response.json();
        if (!data.access_token) {
          return null;
        }

        const expiresInSec = data.expires_in || 86400;
        const expiresAt = Date.now() + (expiresInSec - 300) * 1000;

        const record: ShopifySessionRecord = {
          shop: key,
          accessToken: data.access_token,
          scope: data.scope || REQUIRED_ADMIN_SCOPES.join(","),
          installedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiresAt,
          isOnline: false,
        };

        this.inMemorySessions.set(key, record);

        // Save fresh token to Firestore
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
    console.error("[Shopify Shipping Rates Exception]:", err);
  }

  // Fallback if no specific shipping zone exists for address
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
  authUrl?: string;
}> {
  const domain = shopifyStorage.cleanDomain(orderPayload.storeDomain);
  let token = await shopifyStorage.getOrFetchAdminToken(domain);

  if (!token) {
    const config = getConfig();
    const host = orderPayload.reqHost || "therevivetech.pk";
    const authUrl = `https://${host}/api/shopify/auth?shop=${encodeURIComponent(domain)}`;
    return {
      success: false,
      orderReference: "",
      orderNumber: "",
      totalPrice: 0,
      currency: "PKR",
      error: `Unable to obtain Shopify Admin API authorization for ${domain}. Please authenticate the app via OAuth at ${authUrl} or verify SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET.`,
      authUrl,
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
