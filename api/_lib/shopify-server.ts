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
      const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

      if (serviceAccountStr) {
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
        initializeApp();
      }
    } catch (err) {
      console.warn("[Firebase Admin Init] Server initialization note:", err);
    }
  }

  try {
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
        error: "Firebase Admin SDK initialization failed",
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
 * Automatically manages Admin API access tokens using Shopify's Client Credentials flow
 * (SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET) and caches them in Firestore collection "shopify_tokens".
 */
class ShopifyDatabaseSessionStorage {
  private inMemorySessions: Map<string, ShopifySessionRecord> = new Map();
  private inFlightPromises: Map<string, Promise<ShopifySessionRecord | null>> = new Map();

  public cleanDomain(domain?: string): string {
    const raw = domain || process.env.SHOPIFY_SHOP || process.env.SHOPIFY_STORE_DOMAIN || "dbbys1-nd.myshopify.com";
    return raw.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  public async getSession(shopDomain?: string): Promise<ShopifySessionRecord | null> {
    const key = this.cleanDomain(shopDomain);

    // 1. Check in-memory cache first
    if (this.inMemorySessions.has(key)) {
      const session = this.inMemorySessions.get(key)!;
      // Re-use if valid for at least another 60 seconds
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

    // Deduplicate simultaneous token requests for the same shop
    if (this.inFlightPromises.has(key)) {
      console.log(`[Shopify Client Credentials] Reusing in-flight token request for ${key}...`);
      return this.inFlightPromises.get(key)!;
    }

    const fetchPromise = (async () => {
      const clientId = (process.env.SHOPIFY_CLIENT_ID || process.env.SHOPIFY_API_KEY || "").trim();
      const clientSecret = (process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_API_SECRET || "").trim();

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
          console.error(`[Shopify Client Credentials Failure] Status: ${response.status} | Details: ${errText}`);
          return null;
        }

        const data = await response.json();
        if (!data.access_token) {
          console.error("[Shopify Client Credentials Error] Response missing access_token", data);
          return null;
        }

        const expiresInSec = data.expires_in || 86400; // Default 24 hours
        const expiresAt = Date.now() + (expiresInSec - 300) * 1000; // Refresh 5 minutes before expiration

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
            await db.collection("shopify_tokens").doc(key).set({
              shop: key,
              accessToken: record.accessToken,
              scope: record.scope,
              installedAt: record.installedAt,
              updatedAt: record.updatedAt,
              expiresAt: record.expiresAt || null,
            }, { merge: true });
            console.log(`[Shopify Storage] Token saved to Firestore (collection: "shopify_tokens", doc: "${key}")`);
          } catch (err) {
            console.error("[Shopify Storage] Failed writing token to Firestore:", err);
          }
        }

        console.log(`[Shopify Client Credentials Success] Admin API Token acquired for ${key}. Valid for ${expiresInSec}s.`);

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

    if (!forceRefresh) {
      const session = await this.getSession(key);
      if (session?.accessToken) {
        return session.accessToken;
      }
    } else {
      this.inMemorySessions.delete(key);
    }

    // Try Client Credentials Flow
    const newSession = await this.fetchTokenViaClientCredentials(key);
    if (newSession?.accessToken) {
      return newSession.accessToken;
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
        await db.collection("shopify_tokens").doc(key).set({
          shop: key,
          accessToken: record.accessToken,
          scope: record.scope,
          installedAt: record.installedAt,
          updatedAt: record.updatedAt,
        }, { merge: true });
      } catch (err) {
        console.error("[Shopify Storage] Failed writing session to Firestore:", err);
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
    storeDomain: shopifyStorage.cleanDomain(process.env.SHOPIFY_SHOP || process.env.SHOPIFY_STORE_DOMAIN || "dbbys1-nd.myshopify.com"),
    storefrontToken: (process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "").trim(),
    clientId: (process.env.SHOPIFY_CLIENT_ID || process.env.SHOPIFY_API_KEY || "").trim(),
    clientSecret: (process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_API_SECRET || "").trim(),
    webhookSecret: (process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_API_SECRET || "").trim(),
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

