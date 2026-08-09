import crypto from "crypto";

// Centralized Shopify API Version (Current Stable Release: 2026-07)
export const STABLE_ADMIN_API_VERSION = "2026-07";

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
 * Serverless-Ready Shopify Session & Token Storage
 * -----------------------------------------------
 * Automatically fetches and manages Admin API access tokens using 
 * Shopify's Client Credentials flow (SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET).
 */
class ShopifyDatabaseSessionStorage {
  private inMemorySessions: Map<string, ShopifySessionRecord> = new Map();
  private inFlightPromises: Map<string, Promise<ShopifySessionRecord | null>> = new Map();

  public cleanDomain(domain?: string): string {
    const raw = domain || process.env.SHOPIFY_SHOP || process.env.SHOPIFY_STORE_DOMAIN || "dbbys1-nd.myshopify.com";
    return raw.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  private getRedisCredentials(): { url: string; token: string } | null {
    const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.SHOPIFY_DATABASE_URL || "").trim();
    const token = (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

    if (url && token) {
      return { url, token };
    }
    return null;
  }

  private async redisCommand(cmd: any[]): Promise<any> {
    const creds = this.getRedisCredentials();
    if (!creds) return null;

    try {
      const res = await fetch(creds.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      });

      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return data?.result ?? null;
    } catch (err) {
      console.error("[Shopify Storage] Redis REST command error:", err);
      return null;
    }
  }

  public async getSession(shopDomain?: string): Promise<ShopifySessionRecord | null> {
    const key = this.cleanDomain(shopDomain);
    const redisKey = `shopify:admin:access_token:${key}`;

    // 1. Check in-memory cache first
    if (this.inMemorySessions.has(key)) {
      const session = this.inMemorySessions.get(key)!;
      // Re-use if valid for at least another 60 seconds
      if (!session.expiresAt || session.expiresAt > Date.now() + 60000) {
        return session;
      }
    }

    // 2. Check Vercel KV / Upstash Redis
    const redisResult = await this.redisCommand(["GET", redisKey]);
    if (redisResult) {
      try {
        const record: ShopifySessionRecord = typeof redisResult === "string" ? JSON.parse(redisResult) : redisResult;
        if (record && record.accessToken) {
          this.inMemorySessions.set(key, record);
          if (!record.expiresAt || record.expiresAt > Date.now() + 60000) {
            return record;
          }
        }
      } catch (e) {
        console.error("[Shopify Storage] Error parsing cached token from Redis:", e);
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
        const ttlSec = Math.max(60, expiresInSec - 300);

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

        // Store in Redis with TTL so it auto-expires cleanly
        const redisKey = `shopify:admin:access_token:${key}`;
        await this.redisCommand(["SET", redisKey, JSON.stringify(record), "EX", ttlSec]);

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

    const redisKey = `shopify:admin:access_token:${key}`;
    await this.redisCommand(["SET", redisKey, JSON.stringify(record), "EX", 82800]);

    return record;
  }

  public async deleteSession(shopDomain: string): Promise<void> {
    const key = this.cleanDomain(shopDomain);
    this.inMemorySessions.delete(key);

    const redisKey = `shopify:admin:access_token:${key}`;
    await this.redisCommand(["DEL", redisKey]);
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
