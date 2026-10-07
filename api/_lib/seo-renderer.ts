import fs from "fs";
import path from "path";
import { getConfig, STABLE_STOREFRONT_API_VERSION } from "./shopify-server.js";
import { fetchHomepageDataFromShopify, buildHomepageSemanticHtml } from "./homepage-html-generator.js";

/**
 * Loads the base HTML template from dist/index.html or index.html
 */
export function loadHtmlTemplate(): string {
  try {
    const distIndex = path.join(process.cwd(), "dist", "index.html");
    if (fs.existsSync(distIndex)) {
      return fs.readFileSync(distIndex, "utf-8");
    }
  } catch (e) {
    // Continue
  }

  try {
    const rootIndex = path.join(process.cwd(), "index.html");
    if (fs.existsSync(rootIndex)) {
      return fs.readFileSync(rootIndex, "utf-8");
    }
  } catch (e) {
    // Continue
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/jpeg" href="https://cdn.shopify.com/s/files/1/0610/4642/3631/files/Final_Presentation_Momin_Bhai.jpg?v=1786431805" />
    <link rel="shortcut icon" href="https://cdn.shopify.com/s/files/1/0610/4642/3631/files/Final_Presentation_Momin_Bhai.jpg?v=1786431805" />
    <title>The Revive Tech | Original Gaming Hardware & Tech Store Pakistan</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
}

interface ShopifySeoData {
  title: string | null;
  description: string | null;
}

interface ShopifyImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

interface ShopifyVariant {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
}

interface ShopifyProductSEO {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  vendor: string;
  productType?: string;
  tags?: string[];
  availableForSale: boolean;
  seo?: ShopifySeoData;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice?: { amount: string; currencyCode: string };
  };
  compareAtPriceRange?: {
    minVariantPrice: { amount: string; currencyCode: string };
  } | null;
  featuredImage?: ShopifyImage | null;
  images?: { edges: Array<{ node: ShopifyImage }> };
  variants?: { edges: Array<{ node: ShopifyVariant }> };
}

interface ShopifyCollectionSEO {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  seo?: ShopifySeoData;
  image?: ShopifyImage | null;
  products?: {
    edges: Array<{
      node: {
        id: string;
        handle: string;
        title: string;
        vendor: string;
        description: string;
        availableForSale: boolean;
        featuredImage?: ShopifyImage | null;
        priceRange: {
          minVariantPrice: { amount: string; currencyCode: string };
        };
        compareAtPriceRange?: {
          minVariantPrice: { amount: string; currencyCode: string };
        } | null;
      };
    }>;
  };
}

interface ShopifyArticleSEO {
  id: string;
  handle: string;
  title: string;
  content: string;
  contentHtml?: string;
  excerpt?: string;
  publishedAt: string;
  authorV2?: { name: string };
  seo?: ShopifySeoData;
  image?: ShopifyImage | null;
  tags?: string[];
}

export interface SeoRenderResult {
  statusCode: number;
  html: string;
  isNotFound: boolean;
  redirectUrl?: string;
}

// In-memory cache for SEO queries (5 minutes TTL)
const seoCache = new Map<string, { timestamp: number; data: any }>();
const SEO_CACHE_TTL_MS = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const item = seoCache.get(key);
  if (item && Date.now() - item.timestamp < SEO_CACHE_TTL_MS) {
    return item.data as T;
  }
  if (item) {
    seoCache.delete(key);
  }
  return null;
}

function setCached(key: string, data: any): void {
  seoCache.set(key, { timestamp: Date.now(), data });
}

/**
 * Execute GraphQL against Shopify Storefront API with caching
 */
async function executeStorefrontQuery(query: string, variables: Record<string, any> = {}): Promise<any> {
  const cacheKey = JSON.stringify({ query, variables });
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

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

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      console.warn(`[SEO Storefront API] HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (json.data && !json.errors) {
      setCached(cacheKey, json.data);
      return json.data;
    }
    return json.data || null;
  } catch (error) {
    console.error("[SEO Storefront API Fetch Exception]", error);
    return null;
  }
}

/**
 * Fetch product by handle for SEO
 */
export async function fetchProductForSeo(handle: string): Promise<ShopifyProductSEO | null> {
  const cleanHandle = handle.trim().toLowerCase();
  const query = `
    query getProductForSEO($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        vendor
        productType
        tags
        availableForSale
        seo {
          title
          description
        }
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        compareAtPriceRange {
          minVariantPrice { amount currencyCode }
        }
        featuredImage {
          url
          altText
          width
          height
        }
        images(first: 8) {
          edges {
            node {
              url
              altText
              width
              height
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
              availableForSale
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
            }
          }
        }
      }
    }
  `;

  const data = await executeStorefrontQuery(query, { handle: cleanHandle });
  return data?.product || null;
}

/**
 * Fetch collection by handle for SEO
 */
export async function fetchCollectionForSeo(handle: string): Promise<ShopifyCollectionSEO | null> {
  const cleanHandle = handle.trim().toLowerCase();
  const query = `
    query getCollectionForSEO($handle: String!) {
      collection(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        seo {
          title
          description
        }
        image {
          url
          altText
        }
        products(first: 24) {
          edges {
            node {
              id
              handle
              title
              vendor
              description
              availableForSale
              featuredImage {
                url
                altText
              }
              priceRange {
                minVariantPrice { amount currencyCode }
              }
              compareAtPriceRange {
                minVariantPrice { amount currencyCode }
              }
            }
          }
        }
      }
    }
  `;

  const data = await executeStorefrontQuery(query, { handle: cleanHandle });
  return data?.collection || null;
}

/**
 * Fetch all collections for the /collections directory
 */
export async function fetchCollectionsListForSeo(): Promise<ShopifyCollectionSEO[]> {
  const query = `
    query getCollectionsListForSEO {
      collections(first: 30) {
        edges {
          node {
            id
            handle
            title
            description
            seo { title description }
            image { url altText }
            products(first: 1) {
              edges { node { id } }
            }
          }
        }
      }
    }
  `;

  const data = await executeStorefrontQuery(query);
  return data?.collections?.edges?.map((e: any) => e.node) || [];
}

/**
 * Resolves duplicate clone handles (-copy, -copy-1, -1, -2) to root canonical handle
 */
export function getCanonicalProductHandle(handle: string): string {
  const clean = handle.trim().toLowerCase();
  const match = clean.match(/^(.+?)-(?:copy(?:-\d+)?|\d+)$/);
  if (match && match[1]) {
    return match[1];
  }
  return clean;
}

/**
 * Fetch products list for SEO (used in Homepage & /shop)
 */
export async function fetchProductsListForSeo(first = 36): Promise<any[]> {
  const query = `
    query getProductsForSEOList($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            vendor
            description
            availableForSale
            featuredImage {
              url
              altText
              width
              height
            }
            priceRange {
              minVariantPrice { amount currencyCode }
            }
          }
        }
      }
    }
  `;
  const data = await executeStorefrontQuery(query, { first });
  return data?.products?.edges?.map((e: any) => e.node) || [];
}

/**
 * Fetch blog article by handle for SEO
 */
export async function fetchArticleForSeo(handle: string): Promise<ShopifyArticleSEO | null> {
  const cleanHandle = handle.trim().toLowerCase();
  const query = `
    query getArticleForSEO($handle: String!) {
      articles(first: 10, query: $handle) {
        edges {
          node {
            id
            handle
            title
            content
            contentHtml
            excerpt
            publishedAt
            authorV2 { name }
            seo {
              title
              description
            }
            image {
              url
              altText
            }
            tags
          }
        }
      }
    }
  `;

  const data = await executeStorefrontQuery(query, { handle: cleanHandle });
  const edges = data?.articles?.edges || [];
  const exact = edges.find((e: any) => e.node?.handle?.toLowerCase() === cleanHandle);
  return exact?.node || edges[0]?.node || null;
}

/**
 * Clean text for meta tags and descriptions
 */
function cleanExcerpt(text: string | null | undefined, maxLength = 160): string {
  if (!text) return "";
  const cleaned = text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength - 3).trim() + "...";
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPricePKR(amount: string | number, currency = "PKR"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `₨ 0`;
  const formatted = Math.round(num).toLocaleString("en-PK");
  return currency === "PKR" ? `₨ ${formatted}` : `${currency} ${formatted}`;
}

export interface SeoMetadataOptions {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl?: string;
  ogType?: string;
  robots?: string;
  jsonLdSchemas: any[];
  crawlableHtml: string;
  statusCode?: number;
}

const PRODUCTION_DOMAIN = "https://www.therevivetech.pk";

/**
 * Main SEO HTML Renderer that handles all URLs, fetches live Shopify data,
 * and produces search-engine-ready initial HTML.
 */
export async function renderSeoPage(
  urlPath: string,
  baseTemplateHtml: string,
  host?: string
): Promise<SeoRenderResult> {
  const cleanUrl = urlPath.split("?")[0].replace(/\/+$/, "") || "/";
  const siteUrl = PRODUCTION_DOMAIN;

  // Global Brand Schemas
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "The Revive Tech",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: "Pakistan's Premier Destination for Original Gaming Peripherals & High-Performance Computer Hardware.",
    sameAs: [
      "https://facebook.com/therevivetech",
      "https://instagram.com/therevivetech",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+92-347-5799958",
      email: "therevivetech@gmail.com",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Commercial Market, 96-D, Block D, DHA EME Sector",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      postalCode: "54000",
      addressCountry: "PK",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "The Revive Tech",
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const baseJsonLd = [orgSchema, websiteSchema];

  // Helper Header & Footer for crawlable fallback HTML
  const ssrHeader = `
    <header class="trt-ssr-header" style="background:#111;padding:16px 24px;border-bottom:1px solid #222;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <a href="/" style="font-weight:900;font-size:20px;letter-spacing:1px;color:#C0FE2D;text-decoration:none;">THE REVIVE TECH</a>
      <nav aria-label="Main Navigation" style="display:flex;gap:16px;flex-wrap:wrap;">
        <a href="/shop" style="color:#eee;text-decoration:none;font-size:14px;font-weight:600;">Shop</a>
        <a href="/collections" style="color:#eee;text-decoration:none;font-size:14px;font-weight:600;">Collections</a>
        <a href="/collections/keyboard" style="color:#eee;text-decoration:none;font-size:14px;">Keyboards</a>
        <a href="/collections/mouse" style="color:#eee;text-decoration:none;font-size:14px;">Mice</a>
        <a href="/collections/headsets" style="color:#eee;text-decoration:none;font-size:14px;">Headsets</a>
        <a href="/blog" style="color:#eee;text-decoration:none;font-size:14px;">Blog</a>
        <a href="/about" style="color:#eee;text-decoration:none;font-size:14px;">About</a>
        <a href="/contact" style="color:#eee;text-decoration:none;font-size:14px;">Contact</a>
        <a href="/faq" style="color:#eee;text-decoration:none;font-size:14px;">FAQ</a>
      </nav>
    </header>
  `;

  const ssrFooter = `
    <footer class="trt-ssr-footer" style="background:#0c0c0c;border-top:1px solid #222;padding:32px 24px;margin-top:48px;color:#888;font-size:13px;line-height:1.6;">
      <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;">
        <div>
          <h4 style="color:#fff;margin-bottom:12px;font-size:15px;">The Revive Tech</h4>
          <p>100% Genuine Gaming Hardware, Mechanical Keyboards, Mice & Accessories in Pakistan.</p>
          <p style="margin-top:8px;">Lahore, Punjab, Pakistan • Cash on Delivery Nationwide</p>
        </div>
        <div>
          <h4 style="color:#fff;margin-bottom:12px;font-size:15px;">Hardware Categories</h4>
          <ul style="list-style:none;padding:0;margin:0;line-height:2;">
            <li><a href="/collections/keyboard" style="color:#aaa;text-decoration:none;">Gaming Keyboards</a></li>
            <li><a href="/collections/mouse" style="color:#aaa;text-decoration:none;">Wireless Mice</a></li>
            <li><a href="/collections/headsets" style="color:#aaa;text-decoration:none;">Gaming Headsets</a></li>
            <li><a href="/collections/accessories" style="color:#aaa;text-decoration:none;">Accessories</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;margin-bottom:12px;font-size:15px;">Customer Support</h4>
          <ul style="list-style:none;padding:0;margin:0;line-height:2;">
            <li><a href="/contact" style="color:#aaa;text-decoration:none;">Contact Us</a></li>
            <li><a href="/faq" style="color:#aaa;text-decoration:none;">Warranty & Shipping FAQ</a></li>
            <li><a href="/about" style="color:#aaa;text-decoration:none;">About Our Store</a></li>
            <li><a href="/blog" style="color:#aaa;text-decoration:none;">Hardware Guides</a></li>
          </ul>
        </div>
      </div>
      <div style="max-width:1200px;margin:24px auto 0;padding-top:16px;border-top:1px solid #1a1a1a;text-align:center;color:#666;">
        © ${new Date().getFullYear()} The Revive Tech. All rights reserved.
      </div>
    </footer>
  `;

  // ---------------------------------------------------------------------------
  // 0. PRESERVE SHOPIFY 301 REDIRECTS & LEGACY URL MIGRATIONS
  // ---------------------------------------------------------------------------
  if (cleanUrl.includes("/products/") && cleanUrl.startsWith("/collections/")) {
    const parts = cleanUrl.split("/products/");
    const productHandle = parts[1]?.replace(/^\/+|\/+$/g, "");
    if (productHandle) {
      const canonicalTarget = `${siteUrl}/products/${productHandle}`;
      return {
        statusCode: 301,
        isNotFound: false,
        redirectUrl: canonicalTarget,
        html: `<!doctype html><html><head><meta http-equiv="refresh" content="0;url=${canonicalTarget}"><link rel="canonical" href="${canonicalTarget}"></head><body>Redirecting to <a href="${canonicalTarget}">${canonicalTarget}</a></body></html>`,
      };
    }
  }

  if (cleanUrl === "/collections/all" || cleanUrl === "/all" || cleanUrl === "/products") {
    const canonicalTarget = `${siteUrl}/shop`;
    return {
      statusCode: 301,
      isNotFound: false,
      redirectUrl: canonicalTarget,
      html: `<!doctype html><html><head><meta http-equiv="refresh" content="0;url=${canonicalTarget}"><link rel="canonical" href="${canonicalTarget}"></head><body>Redirecting to <a href="${canonicalTarget}">${canonicalTarget}</a></body></html>`,
    };
  }

  if (cleanUrl.startsWith("/pages/")) {
    const pageHandle = cleanUrl.replace(/^\/pages\//, "").replace(/^\/+|\/+$/g, "");
    const canonicalTarget = `${siteUrl}/${pageHandle}`;
    return {
      statusCode: 301,
      isNotFound: false,
      redirectUrl: canonicalTarget,
      html: `<!doctype html><html><head><meta http-equiv="refresh" content="0;url=${canonicalTarget}"><link rel="canonical" href="${canonicalTarget}"></head><body>Redirecting to <a href="${canonicalTarget}">${canonicalTarget}</a></body></html>`,
    };
  }

  // ---------------------------------------------------------------------------
  // 1. PRODUCT ROUTE: /products/:handle or /product/:handle
  // ---------------------------------------------------------------------------
  if (cleanUrl.startsWith("/products/") || cleanUrl.startsWith("/product/")) {
    const handle = cleanUrl
      .replace(/^\/products\//, "")
      .replace(/^\/product\//, "")
      .replace(/^\/+|\/+$/g, "");

    const canonicalHandle = getCanonicalProductHandle(handle);
    const canonicalUrl = `${siteUrl}/products/${canonicalHandle}`;
    const product = await fetchProductForSeo(handle);

    if (!product) {
      // 404 NOT FOUND for Product
      const notFoundTitle = `Product Not Found | The Revive Tech`;
      const notFoundDesc = `The requested gaming hardware product could not be found. Browse our catalog for 100% original gaming gear in Pakistan.`;
      const notFoundHtml = `
        ${ssrHeader}
        <main style="max-width:800px;margin:60px auto;padding:24px;text-align:center;color:#eee;">
          <h1 style="font-size:32px;color:#fff;margin-bottom:16px;">Product Not Found</h1>
          <p style="color:#aaa;font-size:16px;margin-bottom:32px;">The product handle "${escapeHtml(handle)}" is not currently available.</p>
          <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
            <a href="/shop" style="background:#C0FE2D;color:#111;padding:12px 24px;font-weight:700;border-radius:8px;text-decoration:none;">Browse All Products</a>
            <a href="/collections" style="background:#222;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">View Collections</a>
          </div>
        </main>
        ${ssrFooter}
      `;
      return {
        statusCode: 404,
        isNotFound: true,
        html: injectSeoIntoHtml(baseTemplateHtml, {
          title: notFoundTitle,
          description: notFoundDesc,
          canonicalUrl,
          robots: "noindex, follow",
          jsonLdSchemas: baseJsonLd,
          crawlableHtml: notFoundHtml,
        }),
      };
    }

    // Real Product SEO Data
    const rawTitle = product.seo?.title || `${product.title} | The Revive Tech`;
    const title = rawTitle.includes("The Revive Tech") ? rawTitle : `${rawTitle} | The Revive Tech`;

    const description =
      product.seo?.description ||
      cleanExcerpt(product.description, 160) ||
      `Buy original ${product.title} in Pakistan at best price with official warranty from The Revive Tech. Cash on Delivery nationwide.`;

    const featuredImg = product.featuredImage?.url || `${siteUrl}/og-image.png`;
    const minPrice = product.priceRange?.minVariantPrice?.amount || "0";
    const currency = product.priceRange?.minVariantPrice?.currencyCode || "PKR";
    const formattedPrice = formatPricePKR(minPrice, currency);
    const inStock = product.availableForSale;
    const sku = product.variants?.edges?.[0]?.node?.sku || product.id.replace(/\D/g, "");
    const brand = product.vendor || "The Revive Tech";

    // Rich Product Schema for Google Rich Snippets
    const productSchema: any = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "@id": `${canonicalUrl}#product`,
      name: product.title,
      image: (product.images?.edges || []).map((e) => e.node.url).filter(Boolean),
      description: cleanExcerpt(product.description, 500) || description,
      sku,
      brand: {
        "@type": "Brand",
        name: brand,
      },
      offers: {
        "@type": "Offer",
        url: canonicalUrl,
        priceCurrency: currency,
        price: minPrice,
        priceValidUntil: "2027-12-31",
        itemCondition: "https://schema.org/NewCondition",
        availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "The Revive Tech",
          url: siteUrl,
        },
      },
    };

    if (productSchema.image.length === 0 && featuredImg) {
      productSchema.image = [featuredImg];
    }

    // BreadcrumbList Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Shop", item: `${siteUrl}/shop` },
        { "@type": "ListItem", position: 3, name: product.title, item: canonicalUrl },
      ],
    };

    // Semantic Crawlable Product HTML
    const crawlableHtml = `
      ${ssrHeader}
      <main class="trt-ssr-product" style="max-width:1200px;margin:0 auto;padding:32px 20px;color:#eee;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#888;margin-bottom:24px;">
          <a href="/" style="color:#aaa;text-decoration:none;">Home</a> &gt; 
          <a href="/shop" style="color:#aaa;text-decoration:none;">Shop</a> &gt; 
          <span style="color:#fff;" aria-current="page">${escapeHtml(product.title)}</span>
        </nav>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;align-items:start;">
          <div style="text-align:center;background:#1a1a1a;border-radius:16px;padding:24px;border:1px solid #2a2a2a;">
            <img 
              src="${escapeHtml(featuredImg)}" 
              alt="${escapeHtml(product.featuredImage?.altText || product.title)}" 
              width="${product.featuredImage?.width || 600}" 
              height="${product.featuredImage?.height || 600}" 
              style="max-width:100%;height:auto;border-radius:12px;object-fit:contain;"
              loading="eager"
            />
          </div>
          <div>
            <div style="color:#C0FE2D;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">${escapeHtml(brand)}</div>
            <h1 style="font-size:clamp(22px,3vw,32px);font-weight:800;color:#fff;line-height:1.25;margin:0 0 16px 0;">${escapeHtml(product.title)}</h1>
            <div style="font-size:26px;font-weight:800;color:#fff;margin-bottom:12px;">${formattedPrice}</div>
            <div style="margin-bottom:24px;">
              <span style="display:inline-block;padding:6px 12px;border-radius:6px;font-size:13px;font-weight:700;background:${inStock ? "rgba(192,254,45,0.15)" : "rgba(239,68,68,0.15)"};color:${inStock ? "#C0FE2D" : "#ef4444"};">
                ${inStock ? "✓ In Stock — Express Shipping Across Pakistan" : "Out of Stock"}
              </span>
            </div>
            <div style="margin-bottom:32px;">
              <a href="/cart" style="display:inline-block;background:#C0FE2D;color:#111;font-weight:800;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">
                Order Online (Cash on Delivery)
              </a>
            </div>
            <div style="border-top:1px solid #2a2a2a;padding-top:24px;">
              <h2 style="font-size:18px;font-weight:700;color:#fff;margin-bottom:12px;">Product Details & Overview</h2>
              <div style="color:#bbb;line-height:1.7;font-size:15px;">
                ${product.descriptionHtml || `<p>${escapeHtml(product.description)}</p>`}
              </div>
            </div>
          </div>
        </div>
      </main>
      ${ssrFooter}
    `;

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        imageUrl: featuredImg,
        ogType: "product",
        jsonLdSchemas: [...baseJsonLd, productSchema, breadcrumbSchema],
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 2. COLLECTION ROUTE: /collections/:handle or /collection/:handle
  // ---------------------------------------------------------------------------
  if (
    (cleanUrl.startsWith("/collections/") && cleanUrl !== "/collections") ||
    (cleanUrl.startsWith("/collection/") && cleanUrl !== "/collection")
  ) {
    const handle = cleanUrl
      .replace(/^\/collections\//, "")
      .replace(/^\/collection\//, "")
      .replace(/^\/+|\/+$/g, "");

    const canonicalUrl = `${siteUrl}/collections/${handle}`;
    const collection = await fetchCollectionForSeo(handle);

    if (!collection) {
      // 404 NOT FOUND for Collection
      const notFoundTitle = `Collection Not Found | The Revive Tech`;
      const notFoundDesc = `The requested hardware collection could not be found. Browse our available gaming categories at The Revive Tech.`;
      const notFoundHtml = `
        ${ssrHeader}
        <main style="max-width:800px;margin:60px auto;padding:24px;text-align:center;color:#eee;">
          <h1 style="font-size:32px;color:#fff;margin-bottom:16px;">Collection Not Found</h1>
          <p style="color:#aaa;font-size:16px;margin-bottom:32px;">The collection handle "${escapeHtml(handle)}" is not available.</p>
          <a href="/collections" style="background:#C0FE2D;color:#111;padding:12px 24px;font-weight:700;border-radius:8px;text-decoration:none;">View All Collections</a>
        </main>
        ${ssrFooter}
      `;
      return {
        statusCode: 404,
        isNotFound: true,
        html: injectSeoIntoHtml(baseTemplateHtml, {
          title: notFoundTitle,
          description: notFoundDesc,
          canonicalUrl,
          robots: "noindex, follow",
          jsonLdSchemas: baseJsonLd,
          crawlableHtml: notFoundHtml,
        }),
      };
    }

    const rawTitle = collection.seo?.title || `${collection.title} Price in Pakistan | The Revive Tech`;
    const title = rawTitle.includes("The Revive Tech") ? rawTitle : `${rawTitle} | The Revive Tech`;

    const description =
      collection.seo?.description ||
      cleanExcerpt(collection.description, 160) ||
      `Buy original ${collection.title} in Pakistan at best prices. Fast nationwide shipping & Cash on Delivery from The Revive Tech.`;

    const collectionImg = collection.image?.url || `${siteUrl}/og-image.png`;
    const products = collection.products?.edges?.map((e) => e.node) || [];

    // CollectionPage Schema
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonicalUrl}#collection`,
      name: collection.title,
      description,
      url: canonicalUrl,
      image: collectionImg,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: products.slice(0, 16).map((prod, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${siteUrl}/products/${prod.handle}`,
          name: prod.title,
        })),
      },
    };

    // Breadcrumbs
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Collections", item: `${siteUrl}/collections` },
        { "@type": "ListItem", position: 3, name: collection.title, item: canonicalUrl },
      ],
    };

    // Semantic Crawlable Collection HTML with product links
    const productGridHtml = products
      .map((p) => {
        const pPrice = formatPricePKR(p.priceRange?.minVariantPrice?.amount || "0");
        const pImg = p.featuredImage?.url || `${siteUrl}/og-image.png`;
        return `
          <div style="background:#181818;border:1px solid #262626;border-radius:12px;padding:16px;display:flex;flex-col;gap:12px;">
            <a href="/products/${p.handle}" style="text-decoration:none;display:block;text-align:center;">
              <img src="${escapeHtml(pImg)}" alt="${escapeHtml(p.title)}" width="280" height="280" style="max-width:100%;height:180px;object-fit:contain;border-radius:8px;" loading="lazy" />
              <h3 style="color:#fff;font-size:15px;font-weight:700;margin:12px 0 6px 0;line-height:1.4;">${escapeHtml(p.title)}</h3>
              <div style="color:#C0FE2D;font-weight:800;font-size:16px;">${pPrice}</div>
            </a>
          </div>
        `;
      })
      .join("");

    const crawlableHtml = `
      ${ssrHeader}
      <main class="trt-ssr-collection" style="max-width:1200px;margin:0 auto;padding:32px 20px;color:#eee;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#888;margin-bottom:24px;">
          <a href="/" style="color:#aaa;text-decoration:none;">Home</a> &gt; 
          <a href="/collections" style="color:#aaa;text-decoration:none;">Collections</a> &gt; 
          <span style="color:#fff;" aria-current="page">${escapeHtml(collection.title)}</span>
        </nav>
        <div style="margin-bottom:32px;">
          <h1 style="font-size:clamp(24px,3.5vw,36px);font-weight:900;color:#fff;margin:0 0 12px 0;">${escapeHtml(collection.title)}</h1>
          ${collection.description ? `<p style="color:#aaa;font-size:16px;max-width:800px;line-height:1.6;">${escapeHtml(collection.description)}</p>` : ""}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;">
          ${productGridHtml || `<p style="color:#888;">Items in this collection are currently updating. Browse our full shop.</p>`}
        </div>
      </main>
      ${ssrFooter}
    `;

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        imageUrl: collectionImg,
        ogType: "website",
        jsonLdSchemas: [...baseJsonLd, collectionSchema, breadcrumbSchema],
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 3. COLLECTIONS LIST ROUTE: /collections or /collection
  // ---------------------------------------------------------------------------
  if (cleanUrl === "/collections" || cleanUrl === "/collection") {
    const canonicalUrl = `${siteUrl}/collections`;
    const collections = await fetchCollectionsListForSeo();

    const title = "Gaming Hardware Collections | The Revive Tech Pakistan";
    const description = "Browse official gaming hardware collections including Mechanical Keyboards, Audiophile Headsets, Lightweight Mice, Audio, and Battlestation Accessories.";

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Collections", item: canonicalUrl },
      ],
    };

    const collectionsGridHtml = collections
      .map((c) => `
        <div style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;text-align:center;">
          <a href="/collections/${c.handle}" style="text-decoration:none;color:#fff;display:block;">
            ${c.image?.url ? `<img src="${escapeHtml(c.image.url)}" alt="${escapeHtml(c.title)}" width="240" height="240" style="max-width:100%;height:160px;object-fit:contain;border-radius:8px;margin-bottom:12px;" loading="lazy" />` : ""}
            <h3 style="font-size:18px;font-weight:700;margin:0 0 8px 0;color:#C0FE2D;">${escapeHtml(c.title)}</h3>
            ${c.description ? `<p style="font-size:13px;color:#aaa;line-height:1.5;margin:0;">${cleanExcerpt(c.description, 90)}</p>` : ""}
          </a>
        </div>
      `)
      .join("");

    const crawlableHtml = `
      ${ssrHeader}
      <main style="max-width:1200px;margin:0 auto;padding:32px 20px;color:#eee;">
        <h1 style="font-size:32px;font-weight:900;color:#fff;margin-bottom:12px;">Gaming Hardware Collections</h1>
        <p style="color:#aaa;margin-bottom:32px;">Explore official gaming gear collections with fast delivery across Pakistan.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px;">
          ${collectionsGridHtml}
        </div>
      </main>
      ${ssrFooter}
    `;

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        jsonLdSchemas: [...baseJsonLd, breadcrumbSchema],
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 4. BLOG / ARTICLE ROUTE: /blog/:handle, /blogs/:blog/:handle, /article/:handle
  // ---------------------------------------------------------------------------
  if (
    cleanUrl.startsWith("/blog/") ||
    cleanUrl.startsWith("/blogs/") ||
    cleanUrl.startsWith("/article/")
  ) {
    const parts = cleanUrl.split("/").filter(Boolean);
    const handle = parts[parts.length - 1];
    const canonicalUrl = `${siteUrl}/blog/${handle}`;
    const article = await fetchArticleForSeo(handle);

    if (!article) {
      // 404 for Blog Article
      const notFoundTitle = `Article Not Found | The Revive Tech`;
      const notFoundDesc = `The requested hardware guide could not be found. Read our latest articles at The Revive Tech.`;
      const notFoundHtml = `
        ${ssrHeader}
        <main style="max-width:800px;margin:60px auto;padding:24px;text-align:center;color:#eee;">
          <h1 style="font-size:32px;color:#fff;margin-bottom:16px;">Article Not Found</h1>
          <a href="/blog" style="background:#C0FE2D;color:#111;padding:12px 24px;font-weight:700;border-radius:8px;text-decoration:none;">View All Tech Articles</a>
        </main>
        ${ssrFooter}
      `;
      return {
        statusCode: 404,
        isNotFound: true,
        html: injectSeoIntoHtml(baseTemplateHtml, {
          title: notFoundTitle,
          description: notFoundDesc,
          canonicalUrl,
          robots: "noindex, follow",
          jsonLdSchemas: baseJsonLd,
          crawlableHtml: notFoundHtml,
        }),
      };
    }

    const rawTitle = article.seo?.title || `${article.title} | The Revive Tech Blog`;
    const title = rawTitle.includes("The Revive Tech") ? rawTitle : `${rawTitle} | The Revive Tech`;

    const description =
      article.seo?.description ||
      cleanExcerpt(article.excerpt || article.content, 160) ||
      `Read ${article.title} on The Revive Tech hardware blog.`;

    const articleImg = article.image?.url || `${siteUrl}/og-image.png`;

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      headline: article.title,
      description,
      image: [articleImg],
      datePublished: article.publishedAt || new Date().toISOString(),
      author: {
        "@type": "Person",
        name: article.authorV2?.name || "The Revive Tech Team",
      },
      publisher: {
        "@type": "Organization",
        name: "The Revive Tech",
        logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
      },
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
        { "@type": "ListItem", position: 3, name: article.title, item: canonicalUrl },
      ],
    };

    const crawlableHtml = `
      ${ssrHeader}
      <article class="trt-ssr-article" style="max-width:840px;margin:0 auto;padding:32px 20px;color:#eee;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#888;margin-bottom:24px;">
          <a href="/" style="color:#aaa;text-decoration:none;">Home</a> &gt; 
          <a href="/blog" style="color:#aaa;text-decoration:none;">Blog</a> &gt; 
          <span style="color:#fff;" aria-current="page">${escapeHtml(article.title)}</span>
        </nav>
        <h1 style="font-size:clamp(26px,4vw,38px);font-weight:900;color:#fff;line-height:1.25;margin:0 0 16px 0;">${escapeHtml(article.title)}</h1>
        <div style="color:#888;font-size:14px;margin-bottom:24px;">
          By <strong style="color:#C0FE2D;">${escapeHtml(article.authorV2?.name || "The Revive Tech Team")}</strong>
        </div>
        ${article.image?.url ? `<img src="${escapeHtml(article.image.url)}" alt="${escapeHtml(article.image.altText || article.title)}" width="800" height="450" style="max-width:100%;height:auto;border-radius:12px;margin-bottom:32px;" loading="eager" />` : ""}
        <div style="color:#ccc;line-height:1.8;font-size:16px;">
          ${article.contentHtml || `<p>${escapeHtml(article.content)}</p>`}
        </div>
      </article>
      ${ssrFooter}
    `;

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        imageUrl: articleImg,
        ogType: "article",
        jsonLdSchemas: [...baseJsonLd, articleSchema, breadcrumbSchema],
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 5. BLOG LIST ROUTE: /blog or /blogs
  // ---------------------------------------------------------------------------
  if (cleanUrl === "/blog" || cleanUrl === "/blogs") {
    const canonicalUrl = `${siteUrl}/blog`;
    const title = "Gaming Tech Blog & Hardware Guides | The Revive Tech";
    const description = "Read expert gaming hardware guides, mechanical keyboard switch breakdowns, display refresh rate comparisons, and tech reviews by Pakistani hardware enthusiasts.";

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: canonicalUrl },
      ],
    };

    const crawlableHtml = `
      ${ssrHeader}
      <main style="max-width:1000px;margin:0 auto;padding:32px 20px;color:#eee;">
        <h1 style="font-size:32px;font-weight:900;color:#fff;margin-bottom:12px;">Gaming Tech Blog & Guides</h1>
        <p style="color:#aaa;margin-bottom:32px;">In-depth hardware analysis, peripheral reviews, and competitive setup guides.</p>
      </main>
      ${ssrFooter}
    `;

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        jsonLdSchemas: [...baseJsonLd, breadcrumbSchema],
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 6. SHOP / ALL PRODUCTS: /shop, /explore-all, /sale
  // ---------------------------------------------------------------------------
  if (cleanUrl === "/shop" || cleanUrl === "/explore-all" || cleanUrl === "/sale") {
    const isSale = cleanUrl === "/sale";
    const canonicalUrl = `${siteUrl}${cleanUrl}`;
    const title = isSale
      ? "On Sale Gaming Hardware & Discounted Gear | The Revive Tech"
      : "Shop All Gaming Hardware & Accessories | The Revive Tech";
    const description = "Explore our complete inventory of mechanical keyboards, gaming headsets, 8000Hz gaming mice, and computer hardware in Pakistan with official warranty.";

    const products = await fetchProductsListForSeo(36);

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: products.map((prod, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${siteUrl}/products/${prod.handle}`,
        name: prod.title,
      })),
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: isSale ? "Sale" : "Shop", item: canonicalUrl },
      ],
    };

    const productGridHtml = products
      .map((p) => {
        const pPrice = formatPricePKR(p.priceRange?.minVariantPrice?.amount || "0");
        const pImg = p.featuredImage?.url || `${siteUrl}/og-image.png`;
        return `
          <div style="background:#181818;border:1px solid #262626;border-radius:12px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;">
            <a href="/products/${p.handle}" style="text-decoration:none;color:#fff;display:block;">
              <div style="text-align:center;background:#141414;border-radius:8px;padding:12px;margin-bottom:12px;">
                <img src="${escapeHtml(pImg)}" alt="${escapeHtml(p.title)}" width="240" height="240" style="max-width:100%;height:180px;object-fit:contain;border-radius:6px;" loading="lazy" />
              </div>
              <div style="font-size:11px;font-weight:700;color:#C0FE2D;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${escapeHtml(p.vendor || "The Revive Tech")}</div>
              <h3 style="color:#fff;font-size:14px;font-weight:700;margin:0 0 8px 0;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(p.title)}</h3>
              <div style="color:#C0FE2D;font-weight:800;font-size:17px;margin-top:6px;">${pPrice}</div>
              <div style="display:inline-block;margin-top:6px;font-size:11px;font-weight:700;color:#55efc4;background:rgba(85,239,196,0.1);padding:2px 8px;border-radius:4px;">In Stock • Nationwide Delivery</div>
            </a>
          </div>
        `;
      })
      .join("");

    const crawlableHtml = `
      ${ssrHeader}
      <main style="max-width:1200px;margin:0 auto;padding:32px 20px;color:#eee;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#888;margin-bottom:20px;">
          <a href="/" style="color:#aaa;text-decoration:none;">Home</a> &gt; 
          <span style="color:#fff;" aria-current="page">${isSale ? "Sale" : "Shop"}</span>
        </nav>
        <h1 style="font-size:clamp(26px,3.5vw,36px);font-weight:900;color:#fff;margin-bottom:12px;">${isSale ? "Gaming Hardware on Sale in Pakistan" : "Shop All Original Gaming Hardware & Peripherals in Pakistan"}</h1>
        <p style="color:#aaa;font-size:15px;line-height:1.6;max-width:850px;margin-bottom:28px;">
          Browse Pakistan's premier catalog of 100% genuine gaming hardware and esports peripherals. Explore mechanical keyboards, 8000Hz wireless gaming mice, audiophile IEMs, and desktop accessories with nationwide Cash on Delivery and official warranty support.
        </p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:32px;">
          <a href="/collections/keyboard" style="background:#222;color:#C0FE2D;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">Mechanical Keyboards</a>
          <a href="/collections/mouse" style="background:#222;color:#C0FE2D;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">Gaming Mice</a>
          <a href="/collections/headsets" style="background:#222;color:#C0FE2D;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">Esports Headsets</a>
          <a href="/collections/iems" style="background:#222;color:#C0FE2D;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">IEMs & Audio</a>
          <a href="/collections/accessories" style="background:#222;color:#C0FE2D;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">Desk Accessories</a>
          <a href="/collections" style="background:#1a1a1a;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;">All Collections &rarr;</a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;">
          ${productGridHtml}
        </div>
        <div style="margin-top:40px;text-align:center;padding:24px;background:#181818;border-radius:12px;border:1px solid #262626;">
          <h2 style="font-size:18px;color:#fff;margin:0 0 8px 0;">Looking for specific gaming gear?</h2>
          <p style="color:#aaa;font-size:14px;margin:0 0 16px 0;">Our hardware engineers in Lahore can assist you with switch compatibility, custom orders, or warranty claims.</p>
          <a href="/contact" style="background:#C0FE2D;color:#111;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">Contact Tech Support</a>
        </div>
      </main>
      ${ssrFooter}
    `;

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        jsonLdSchemas: [...baseJsonLd, breadcrumbSchema, itemListSchema],
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 7. ABOUT US ROUTE: /about
  // ---------------------------------------------------------------------------
  if (cleanUrl === "/about") {
    const canonicalUrl = `${siteUrl}/about`;
    const title = "About The Revive Tech | Premier Gaming Hardware Store Pakistan";
    const description = "Learn about The Revive Tech — Pakistan's trusted destination for 100% original esports gear, custom mechanical keyboards, ultralight gaming mice, and computer peripherals based in Lahore.";

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "About Us", item: canonicalUrl },
      ],
    };

    const crawlableHtml = `
      ${ssrHeader}
      <main style="max-width:800px;margin:0 auto;padding:40px 20px;color:#eee;line-height:1.7;">
        <h1 style="font-size:34px;font-weight:900;color:#fff;margin-bottom:16px;">About The Revive Tech</h1>
        <p style="font-size:17px;color:#ccc;margin-bottom:20px;">
          The Revive Tech was founded with a singular mission: to provide competitive gamers and tech enthusiasts in Pakistan with guaranteed 100% genuine, authentic gaming peripherals and computer hardware.
        </p>
        <p style="color:#aaa;margin-bottom:16px;">
          Based in Lahore, we fulfill express orders across all major cities of Pakistan including Karachi, Islamabad, Rawalpindi, Faisalabad, and beyond, with trusted Cash on Delivery (COD) and nationwide brand warranty.
        </p>
      </main>
      ${ssrFooter}
    `;

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        jsonLdSchemas: [...baseJsonLd, breadcrumbSchema],
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 8. CONTACT ROUTE: /contact
  // ---------------------------------------------------------------------------
  if (cleanUrl === "/contact") {
    const canonicalUrl = `${siteUrl}/contact`;
    const title = "Contact Us & Customer Support | The Revive Tech Pakistan";
    const description = "Get in touch with The Revive Tech team in Lahore for order status tracking, product availability inquiries, switch compatibility, or warranty claims via WhatsApp or phone.";

    const contactSchema = {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": `${canonicalUrl}#contact`,
      name: "Contact The Revive Tech",
      description,
      url: canonicalUrl,
      mainEntity: {
        "@type": "Organization",
        name: "The Revive Tech",
        telephone: "+92-347-5799958",
        email: "therevivetech@gmail.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Commercial Market, 96-D, Block D, DHA EME Sector",
          addressLocality: "Lahore",
          addressRegion: "Punjab",
          postalCode: "54000",
          addressCountry: "PK",
        },
      },
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Contact", item: canonicalUrl },
      ],
    };

    const crawlableHtml = `
      ${ssrHeader}
      <main style="max-width:800px;margin:0 auto;padding:40px 20px;color:#eee;line-height:1.7;">
        <h1 style="font-size:34px;font-weight:900;color:#fff;margin-bottom:16px;">Contact Customer Support</h1>
        <p style="color:#aaa;margin-bottom:24px;">Need assistance with an order, product compatibility, or warranty? Reach out to our team.</p>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h3 style="color:#C0FE2D;margin-top:0;">Fulfillment Hub & Headquarters</h3>
          <p style="margin:4px 0;">Commercial Market, 96-D, Block D, DHA EME Sector, Lahore, Pakistan</p>
          <p style="margin:4px 0;">Email: <a href="mailto:therevivetech@gmail.com" style="color:#fff;">therevivetech@gmail.com</a></p>
          <p style="margin:4px 0;">Phone / WhatsApp: <a href="https://wa.me/923475799958" style="color:#C0FE2D;text-decoration:none;">0347 5799958 (+92-347-5799958)</a></p>
        </div>
      </main>
      ${ssrFooter}
    `;

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        jsonLdSchemas: [...baseJsonLd, contactSchema, breadcrumbSchema],
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 9. FAQ ROUTE: /faq
  // ---------------------------------------------------------------------------
  if (cleanUrl === "/faq") {
    const canonicalUrl = `${siteUrl}/faq`;
    const title = "Frequently Asked Questions (FAQ) | Warranty & Shipping | The Revive Tech";
    const description = "Find clear answers regarding Cash on Delivery, official brand warranty claims, express delivery timelines across Pakistan, order cancellation, and product authenticity.";

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How does The Revive Tech ensure 100% authentic products in Pakistan?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "All items in our store are sourced directly from authorized brand distributors with verified serial numbers that can be registered on official manufacturer software. We guarantee 100% genuine hardware with official local warranty support.",
          },
        },
        {
          "@type": "Question",
          name: "What payment methods are accepted for orders?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We accept Visa & Mastercard Credit/Debit Cards, Direct Bank Transfers, mobile payment wallets (JazzCash & EasyPaisa), and Cash on Delivery (COD) across Pakistan.",
          },
        },
        {
          "@type": "Question",
          name: "What warranty coverage is provided on products?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "All products sold by The Revive Tech are 100% genuine with official brand warranty support. Specific warranty periods are stated on individual product listings.",
          },
        },
        {
          "@type": "Question",
          name: "How fast is express shipping for hardware orders?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Orders placed before 2 PM PST are dispatched same-day from our Lahore fulfillment hub. Express domestic shipping takes 1-2 business days with full real-time courier tracking codes sent via SMS and email.",
          },
        },
      ],
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "FAQ", item: canonicalUrl },
      ],
    };

    const crawlableHtml = `
      ${ssrHeader}
      <main style="max-width:800px;margin:0 auto;padding:40px 20px;color:#eee;line-height:1.7;">
        <h1 style="font-size:34px;font-weight:900;color:#fff;margin-bottom:16px;">Frequently Asked Questions</h1>
        <p style="color:#aaa;margin-bottom:32px;">Answers to common questions about authenticity, shipping timelines, and payment methods.</p>
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div style="background:#1a1a1a;border:1px solid #262626;border-radius:12px;padding:20px;">
            <h3 style="color:#fff;margin-top:0;">How does The Revive Tech guarantee 100% authentic hardware?</h3>
            <p style="color:#aaa;margin-bottom:0;">All items are sourced directly from authorized brand distributors with genuine serial numbers eligible for official manufacturer software registration.</p>
          </div>
          <div style="background:#1a1a1a;border:1px solid #262626;border-radius:12px;padding:20px;">
            <h3 style="color:#fff;margin-top:0;">What are the shipping times across Pakistan?</h3>
            <p style="color:#aaa;margin-bottom:0;">Orders placed before 2 PM PST ship same-day from our Lahore warehouse. Delivery typically takes 1-2 business days for major cities with tracking codes provided.</p>
          </div>
          <div style="background:#1a1a1a;border:1px solid #262626;border-radius:12px;padding:20px;">
            <h3 style="color:#fff;margin-top:0;">Is Cash on Delivery (COD) available?</h3>
            <p style="color:#aaa;margin-bottom:0;">Yes, we offer Cash on Delivery nationwide for all verified domestic orders.</p>
          </div>
        </div>
      </main>
      ${ssrFooter}
    `;

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        jsonLdSchemas: [...baseJsonLd, faqSchema, breadcrumbSchema],
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 10. LEGAL & POLICY PAGES: /terms-of-service, /privacy-policy, /refund-policy, /shipping-policy
  // ---------------------------------------------------------------------------
  if (
    cleanUrl === "/terms-of-service" ||
    cleanUrl === "/privacy-policy" ||
    cleanUrl === "/refund-policy" ||
    cleanUrl === "/shipping-policy"
  ) {
    const pageTitleMap: Record<string, string> = {
      "/terms-of-service": "Terms of Service",
      "/privacy-policy": "Privacy Policy",
      "/refund-policy": "Refund & Return Policy",
      "/shipping-policy": "Shipping & Delivery Policy",
    };
    const titleText = pageTitleMap[cleanUrl] || "Policy";
    const canonicalUrl = `${siteUrl}${cleanUrl}`;
    const title = `${titleText} | The Revive Tech`;
    const description = `Read our official ${titleText.toLowerCase()} at The Revive Tech Pakistan.`;

    const crawlableHtml = `
      ${ssrHeader}
      <main style="max-width:800px;margin:0 auto;padding:40px 20px;color:#eee;line-height:1.7;">
        <h1 style="font-size:32px;font-weight:900;color:#fff;margin-bottom:16px;">${escapeHtml(titleText)}</h1>
        <p style="color:#aaa;">Official policies for orders, privacy, and customer satisfaction at The Revive Tech.</p>
      </main>
      ${ssrFooter}
    `;

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        jsonLdSchemas: baseJsonLd,
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 11. UTILITY PAGES (Cart, Search, Account, Checkout) -> noindex, follow
  // ---------------------------------------------------------------------------
  if (
    cleanUrl === "/cart" ||
    cleanUrl === "/checkout" ||
    cleanUrl === "/search" ||
    cleanUrl === "/account" ||
    cleanUrl.startsWith("/order-confirmation")
  ) {
    const canonicalUrl = `${siteUrl}${cleanUrl}`;
    const utilityTitles: Record<string, string> = {
      "/cart": "Shopping Cart | The Revive Tech",
      "/checkout": "Secure Checkout | The Revive Tech",
      "/search": "Search Hardware | The Revive Tech",
      "/account": "My Account | The Revive Tech",
    };
    const title = utilityTitles[cleanUrl] || "The Revive Tech";
    const description = "Original Gaming Hardware & Tech Store Pakistan.";

    const crawlableHtml = `
      ${ssrHeader}
      <main style="max-width:600px;margin:60px auto;padding:24px;text-align:center;color:#eee;">
        <h1 style="font-size:28px;color:#fff;margin-bottom:12px;">${escapeHtml(title)}</h1>
        <p style="color:#aaa;">Loading your session details...</p>
      </main>
      ${ssrFooter}
    `;

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        robots: "noindex, follow",
        jsonLdSchemas: baseJsonLd,
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 12. HOMEPAGE: /
  // ---------------------------------------------------------------------------
  if (cleanUrl === "/" || cleanUrl === "") {
    const canonicalUrl = `${siteUrl}/`;
    const title = "The Revive Tech | Original Gaming Hardware & Tech Store Pakistan";
    const description = "Shop 100% genuine gaming keyboards, wireless headsets, ultralight mice, and PC accessories in Pakistan at best prices with nationwide Cash on Delivery.";

    const homeData = await fetchHomepageDataFromShopify();
    const crawlableHtml = buildHomepageSemanticHtml(homeData);

    const homeItemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: (homeData.featuredProducts || []).map((prod, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${siteUrl}/products/${prod.handle}`,
        name: prod.title,
      })),
    };

    return {
      statusCode: 200,
      isNotFound: false,
      html: injectSeoIntoHtml(baseTemplateHtml, {
        title,
        description,
        canonicalUrl,
        jsonLdSchemas: [...baseJsonLd, homeItemListSchema],
        crawlableHtml,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // 13. UNKNOWN ROUTE -> 404 NOT FOUND
  // ---------------------------------------------------------------------------
  const notFoundTitle = `404 - Page Not Found | The Revive Tech`;
  const notFoundDesc = `The requested page could not be found. Browse Pakistan's leading gaming hardware store at The Revive Tech.`;
  const notFoundHtml = `
    ${ssrHeader}
    <main style="max-width:800px;margin:80px auto;padding:24px;text-align:center;color:#eee;">
      <h1 style="font-size:42px;font-weight:900;color:#fff;margin-bottom:16px;">404 — Page Not Found</h1>
      <p style="color:#aaa;font-size:18px;margin-bottom:32px;">The page you are looking for does not exist or may have been moved.</p>
      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
        <a href="/" style="background:#C0FE2D;color:#111;padding:12px 24px;font-weight:700;border-radius:8px;text-decoration:none;">Go to Homepage</a>
        <a href="/shop" style="background:#222;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Browse Products</a>
      </div>
    </main>
    ${ssrFooter}
  `;

  return {
    statusCode: 404,
    isNotFound: true,
    html: injectSeoIntoHtml(baseTemplateHtml, {
      title: notFoundTitle,
      description: notFoundDesc,
      canonicalUrl: `${siteUrl}${cleanUrl}`,
      robots: "noindex, follow",
      jsonLdSchemas: baseJsonLd,
      crawlableHtml: notFoundHtml,
    }),
  };
}

/**
 * Injects SEO tags into the head and crawlable semantic HTML into #root
 */
function injectSeoIntoHtml(baseHtml: string, options: SeoMetadataOptions): string {
  const {
    title,
    description,
    canonicalUrl,
    imageUrl = `${PRODUCTION_DOMAIN}/og-image.png`,
    ogType = "website",
    robots = "index, follow",
    jsonLdSchemas = [],
    crawlableHtml,
  } = options;

  let html = baseHtml;

  // 1. Replace or insert <title>
  if (/<title>[^<]*<\/title>/i.test(html)) {
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  } else {
    html = html.replace(/<head>/i, `<head>\n    <title>${escapeHtml(title)}</title>`);
  }

  // 2. Prepare comprehensive SEO tags
  const tags = `
    <!-- Comprehensive Technical SEO & Social Tags -->
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${escapeHtml(robots)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

    <!-- Open Graph Social Media -->
    <meta property="og:site_name" content="The Revive Tech" />
    <meta property="og:type" content="${escapeHtml(ogType)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:locale" content="en_PK" />

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />

    <!-- Schema.org JSON-LD Structured Data -->
    <script id="seo-jsonld" type="application/ld+json">
${JSON.stringify(jsonLdSchemas, null, 2)}
    </script>
`;

  // Remove any pre-existing meta description, robots, canonical, OG, and Twitter tags in base template
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+name=["']robots["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "");
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");
  html = html.replace(/<script\s+id=["']seo-jsonld["'][^>]*>[\s\S]*?<\/script>/gi, "");

  // Insert before </head>
  html = html.replace(/<\/head>/i, `${tags}\n  </head>`);

  // 3. Inject crawlable semantic HTML into <div id="root">
  if (crawlableHtml && /<div\s+id=["']root["']>\s*<\/div>/i.test(html)) {
    html = html.replace(
      /<div\s+id=["']root["']>\s*<\/div>/i,
      `<div id="root">\n${crawlableHtml}\n    </div>`
    );
  }

  return html;
}
