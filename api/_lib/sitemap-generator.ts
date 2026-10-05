import { getConfig, STABLE_STOREFRONT_API_VERSION } from "./shopify-server.js";

const CANONICAL_BASE = "https://www.therevivetech.pk";

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
}

interface CacheItem {
  xml: string;
  timestamp: number;
}

let cachedSitemap: CacheItem | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour in-memory cache

/**
 * Normalizes ISO date string to YYYY-MM-DD
 */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

/**
 * Escapes XML special characters for safety in <loc>
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Execute Storefront GraphQL query
 */
async function queryStorefront(query: string, variables: Record<string, any> = {}): Promise<any> {
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

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify Storefront GraphQL HTTP ${response.status}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0]?.message || "Shopify Storefront GraphQL error");
  }

  return json.data;
}

/**
 * Fetch ALL products using Storefront API cursor pagination (up to 250 items per batch)
 */
async function fetchAllProducts(): Promise<Array<{ handle: string; updatedAt?: string }>> {
  const products: Array<{ handle: string; updatedAt?: string }> = [];
  let cursor: string | null = null;
  let hasNext = true;
  let page = 1;
  const maxPages = 40; // up to 10,000 products safety guard

  const query = `
    query getProductsSitemap($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            handle
            updatedAt
          }
        }
      }
    }
  `;

  while (hasNext && page <= maxPages) {
    try {
      const data = await queryStorefront(query, { first: 250, after: cursor });
      const pageInfo = data?.products?.pageInfo;
      const edges = data?.products?.edges || [];

      for (const edge of edges) {
        if (edge.node?.handle) {
          products.push({
            handle: edge.node.handle,
            updatedAt: edge.node.updatedAt,
          });
        }
      }

      hasNext = Boolean(pageInfo?.hasNextPage);
      cursor = pageInfo?.endCursor || null;
      page++;
      if (!cursor) break;
    } catch (err) {
      console.error(`[Sitemap Error] Fetching products batch ${page}:`, err);
      break;
    }
  }

  return products;
}

/**
 * Fetch ALL collections using Storefront API cursor pagination (up to 250 items per batch)
 */
async function fetchAllCollections(): Promise<Array<{ handle: string; updatedAt?: string }>> {
  const collections: Array<{ handle: string; updatedAt?: string }> = [];
  let cursor: string | null = null;
  let hasNext = true;
  let page = 1;
  const maxPages = 10; // up to 2,500 collections safety guard

  const query = `
    query getCollectionsSitemap($first: Int!, $after: String) {
      collections(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            handle
            updatedAt
          }
        }
      }
    }
  `;

  while (hasNext && page <= maxPages) {
    try {
      const data = await queryStorefront(query, { first: 250, after: cursor });
      const pageInfo = data?.collections?.pageInfo;
      const edges = data?.collections?.edges || [];

      for (const edge of edges) {
        if (edge.node?.handle) {
          collections.push({
            handle: edge.node.handle,
            updatedAt: edge.node.updatedAt,
          });
        }
      }

      hasNext = Boolean(pageInfo?.hasNextPage);
      cursor = pageInfo?.endCursor || null;
      page++;
      if (!cursor) break;
    } catch (err) {
      console.error(`[Sitemap Error] Fetching collections batch ${page}:`, err);
      break;
    }
  }

  return collections;
}

/**
 * Fetch ALL blog articles using Storefront API cursor pagination
 */
async function fetchAllArticles(): Promise<Array<{ handle: string; publishedAt?: string }>> {
  const articles: Array<{ handle: string; publishedAt?: string }> = [];
  let cursor: string | null = null;
  let hasNext = true;
  let page = 1;
  const maxPages = 10;

  const query = `
    query getArticlesSitemap($first: Int!, $after: String) {
      articles(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            handle
            publishedAt
          }
        }
      }
    }
  `;

  while (hasNext && page <= maxPages) {
    try {
      const data = await queryStorefront(query, { first: 250, after: cursor });
      const pageInfo = data?.articles?.pageInfo;
      const edges = data?.articles?.edges || [];

      for (const edge of edges) {
        if (edge.node?.handle) {
          articles.push({
            handle: edge.node.handle,
            publishedAt: edge.node.publishedAt,
          });
        }
      }

      hasNext = Boolean(pageInfo?.hasNextPage);
      cursor = pageInfo?.endCursor || null;
      page++;
      if (!cursor) break;
    } catch (err) {
      console.error(`[Sitemap Error] Fetching articles batch ${page}:`, err);
      break;
    }
  }

  return articles;
}

/**
 * Generates the complete, production-grade XML sitemap
 */
export async function generateSitemapXml(forceFresh = false): Promise<string> {
  const now = Date.now();
  if (!forceFresh && cachedSitemap && now - cachedSitemap.timestamp < CACHE_TTL_MS) {
    return cachedSitemap.xml;
  }

  const today = formatDate();
  const entries: SitemapEntry[] = [];
  const seenUrls = new Set<string>();

  const addEntry = (path: string, priority: string, changefreq: SitemapEntry["changefreq"], dateStr?: string) => {
    const cleanPath = path === "" || path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;
    const fullUrl = cleanPath === "/" ? `${CANONICAL_BASE}/` : `${CANONICAL_BASE}${cleanPath}`;
    if (seenUrls.has(fullUrl)) return;
    seenUrls.add(fullUrl);

    entries.push({
      loc: fullUrl,
      lastmod: formatDate(dateStr || today),
      changefreq,
      priority,
    });
  };

  // 1. Core Homepage
  addEntry("", "1.0", "daily", today);

  // 2. Main Catalog Index & Hubs
  addEntry("/shop", "0.9", "daily", today);
  addEntry("/collections", "0.9", "daily", today);

  // 3. Blog Hub
  addEntry("/blog", "0.8", "weekly", today);

  // 4. Static Indexable Core Pages
  addEntry("/about", "0.7", "monthly", today);
  addEntry("/contact", "0.7", "monthly", today);
  addEntry("/faq", "0.7", "monthly", today);
  addEntry("/terms-of-service", "0.5", "monthly", today);
  addEntry("/privacy-policy", "0.5", "monthly", today);
  addEntry("/refund-policy", "0.5", "monthly", today);
  addEntry("/shipping-policy", "0.5", "monthly", today);

  // 5. Fetch Dynamic Data from Shopify concurrently
  try {
    const [products, collections, articles] = await Promise.all([
      fetchAllProducts(),
      fetchAllCollections(),
      fetchAllArticles(),
    ]);

    // Add Collections
    for (const col of collections) {
      if (col.handle) {
        addEntry(`/collections/${col.handle}`, "0.9", "daily", col.updatedAt);
      }
    }

    // Add Products
    for (const prod of products) {
      if (prod.handle) {
        addEntry(`/products/${prod.handle}`, "0.9", "daily", prod.updatedAt);
      }
    }

    // Add Blog Articles
    for (const art of articles) {
      if (art.handle) {
        addEntry(`/blog/${art.handle}`, "0.7", "weekly", art.publishedAt);
      }
    }
  } catch (err) {
    console.error("[Sitemap Generation Warning] Partial failure fetching catalog:", err);
  }

  // Construct standard valid XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const item of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
    xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  cachedSitemap = {
    xml,
    timestamp: now,
  };

  return xml;
}
