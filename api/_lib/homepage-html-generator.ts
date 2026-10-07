import { getConfig, STABLE_STOREFRONT_API_VERSION } from "./shopify-server.js";

const SITE_URL = "https://www.therevivetech.pk";

interface ProductItem {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  price: string;
  compareAtPrice?: string | null;
  currency: string;
  imageUrl?: string;
  altText?: string;
}

interface CollectionItem {
  id: string;
  handle: string;
  title: string;
  description?: string;
  products: ProductItem[];
}

interface ArticleItem {
  id: string;
  handle: string;
  title: string;
  excerpt?: string;
  publishedAt: string;
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
  if (isNaN(num)) return `Rs. 0`;
  return `Rs. ${num.toLocaleString("en-PK")}`;
}

/**
 * Queries Storefront API to fetch comprehensive real homepage data
 */
export async function fetchHomepageDataFromShopify(): Promise<{
  featuredProducts: ProductItem[];
  collections: CollectionItem[];
  flashDeals: ProductItem[];
  articles: ArticleItem[];
}> {
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
    query getHomepageData {
      collections(first: 25) {
        edges {
          node {
            id
            handle
            title
            description
            products(first: 8) {
              edges {
                node {
                  id
                  handle
                  title
                  vendor
                  availableForSale
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  compareAtPriceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  featuredImage {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
      articles(first: 8) {
        edges {
          node {
            id
            handle
            title
            excerpt
            publishedAt
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      console.warn(`[Homepage Data Fetch] HTTP ${res.status}`);
      return { featuredProducts: [], collections: [], flashDeals: [], articles: [] };
    }

    const json = await res.json();
    const collectionEdges = json.data?.collections?.edges || [];
    const articleEdges = json.data?.articles?.edges || [];

    const parsedCollections: CollectionItem[] = [];
    const allProducts: ProductItem[] = [];
    const flashDeals: ProductItem[] = [];

    for (const cEdge of collectionEdges) {
      const node = cEdge.node;
      if (!node || !node.handle) continue;

      const products: ProductItem[] = [];
      const prodEdges = node.products?.edges || [];

      for (const pEdge of prodEdges) {
        const p = pEdge.node;
        if (!p || !p.handle) continue;

        const price = p.priceRange?.minVariantPrice?.amount || "0";
        const currency = p.priceRange?.minVariantPrice?.currencyCode || "PKR";
        const compareAt = p.compareAtPriceRange?.minVariantPrice?.amount || null;

        const prodItem: ProductItem = {
          id: p.id,
          handle: p.handle,
          title: p.title,
          vendor: p.vendor || "The Revive Tech",
          price,
          compareAtPrice: compareAt,
          currency,
          imageUrl: p.featuredImage?.url,
          altText: p.featuredImage?.altText || p.title,
        };

        products.push(prodItem);
        allProducts.push(prodItem);

        if (compareAt && parseFloat(compareAt) > parseFloat(price)) {
          flashDeals.push(prodItem);
        }
      }

      if (products.length > 0) {
        parsedCollections.push({
          id: node.id,
          handle: node.handle,
          title: node.title,
          description: node.description,
          products,
        });
      }
    }

    // Identify features collection or fallback to top products
    const featuresCol = parsedCollections.find(
      (c) => c.handle.toLowerCase() === "features"
    );
    const featuredProducts = featuresCol?.products?.length
      ? featuresCol.products
      : allProducts.slice(0, 12);

    const parsedArticles: ArticleItem[] = articleEdges.map((a: any) => ({
      id: a.node.id,
      handle: a.node.handle,
      title: a.node.title,
      excerpt: a.node.excerpt,
      publishedAt: a.node.publishedAt,
    }));

    return {
      featuredProducts,
      collections: parsedCollections,
      flashDeals: flashDeals.length > 0 ? flashDeals.slice(0, 8) : allProducts.slice(0, 8),
      articles: parsedArticles,
    };
  } catch (error) {
    console.error("[Homepage Data Fetch Exception]", error);
    return { featuredProducts: [], collections: [], flashDeals: [], articles: [] };
  }
}

/**
 * Builds the complete semantic, crawlable HTML representing the visual homepage
 */
export function buildHomepageSemanticHtml(data: {
  featuredProducts: ProductItem[];
  collections: CollectionItem[];
  flashDeals: ProductItem[];
  articles: ArticleItem[];
}): string {
  const { featuredProducts, collections, flashDeals, articles } = data;

  // Render a product card
  const renderProductCard = (p: ProductItem) => {
    const formattedPrice = formatPricePKR(p.price, p.currency);
    const formattedCompareAt = p.compareAtPrice ? formatPricePKR(p.compareAtPrice, p.currency) : null;
    const imgUrl = p.imageUrl || `${SITE_URL}/og-image.png`;

    return `
      <article style="background:#181818;border:1px solid #262626;border-radius:12px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;transition:border-color 0.2s;">
        <a href="/products/${escapeHtml(p.handle)}" style="text-decoration:none;color:#fff;display:block;">
          <div style="text-align:center;background:#141414;border-radius:8px;padding:12px;margin-bottom:12px;">
            <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.altText || p.title)}" width="240" height="240" style="max-width:100%;height:180px;object-fit:contain;border-radius:6px;" loading="lazy" />
          </div>
          <div style="font-size:11px;font-weight:700;color:#C0FE2D;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${escapeHtml(p.vendor)}</div>
          <h3 style="color:#fff;font-size:14px;font-weight:700;margin:0 0 8px 0;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(p.title)}</h3>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
            <span style="color:#C0FE2D;font-weight:800;font-size:17px;">${formattedPrice}</span>
            ${formattedCompareAt ? `<span style="color:#888;font-size:13px;text-decoration:line-through;">${formattedCompareAt}</span>` : ""}
          </div>
          <div style="display:inline-block;margin-top:8px;font-size:11px;font-weight:700;color:#55efc4;background:rgba(85,239,196,0.1);padding:3px 8px;border-radius:4px;">In Stock • Nationwide Delivery</div>
        </a>
      </article>
    `;
  };

  // 1. Featured Products Grid
  const featuredProductsHtml = featuredProducts.map(renderProductCard).join("");

  // 2. Collection Sections (Batch 1 & 2)
  const collectionSectionsHtml = collections
    .filter((c) => c.products.length > 0 && c.handle.toLowerCase() !== "features")
    .map((col) => {
      const colCards = col.products.map(renderProductCard).join("");
      return `
        <section style="margin-bottom:48px;" aria-labelledby="heading-${escapeHtml(col.handle)}">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
            <div>
              <span style="font-size:11px;font-mono;font-weight:700;color:#C0FE2D;text-transform:uppercase;letter-spacing:1px;background:rgba(192,254,45,0.1);padding:3px 8px;border-radius:4px;border:1px solid rgba(192,254,45,0.25);">${col.products.length} ITEMS</span>
              <h2 id="heading-${escapeHtml(col.handle)}" style="font-size:24px;font-weight:800;color:#fff;margin:6px 0 4px 0;">${escapeHtml(col.title)}</h2>
              ${col.description ? `<p style="color:#aaa;font-size:13px;margin:0;">${escapeHtml(col.description)}</p>` : ""}
            </div>
            <a href="/collections/${escapeHtml(col.handle)}" style="color:#C0FE2D;font-weight:700;font-size:14px;text-decoration:none;">Explore ${escapeHtml(col.title)} &rarr;</a>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;">
            ${colCards}
          </div>
        </section>
      `;
    })
    .join("");

  // 3. Flash Deals
  const flashDealsHtml = flashDeals.map(renderProductCard).join("");

  // 4. Articles Grid
  const articlesHtml = articles
    .map(
      (a) => `
      <article style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;">
        <span style="font-size:11px;color:#C0FE2D;font-weight:700;text-transform:uppercase;">Guide</span>
        <h3 style="font-size:16px;font-weight:700;color:#fff;margin:8px 0;">
          <a href="/blog/${escapeHtml(a.handle)}" style="color:#fff;text-decoration:none;">${escapeHtml(a.title)}</a>
        </h3>
        ${a.excerpt ? `<p style="color:#aaa;font-size:13px;line-height:1.5;margin:0 0 12px 0;">${escapeHtml(a.excerpt)}</p>` : ""}
        <a href="/blog/${escapeHtml(a.handle)}" style="color:#C0FE2D;font-size:13px;font-weight:700;text-decoration:none;">Read Full Guide &rarr;</a>
      </article>
    `
    )
    .join("");

  return `
    <!-- Top Site Navigation Header -->
    <header class="trt-ssr-header" style="background:#111;padding:16px 24px;border-bottom:1px solid #222;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <a href="/" style="font-weight:900;font-size:22px;letter-spacing:1px;color:#C0FE2D;text-decoration:none;">THE REVIVE TECH</a>
      <nav aria-label="Main Navigation" style="display:flex;gap:16px;flex-wrap:wrap;">
        <a href="/shop" style="color:#eee;text-decoration:none;font-size:14px;font-weight:600;">Shop</a>
        <a href="/collections" style="color:#eee;text-decoration:none;font-size:14px;font-weight:600;">Collections</a>
        <a href="/collections/keyboard" style="color:#eee;text-decoration:none;font-size:14px;">Keyboards</a>
        <a href="/collections/mouse" style="color:#eee;text-decoration:none;font-size:14px;">Mice</a>
        <a href="/collections/headsets" style="color:#eee;text-decoration:none;font-size:14px;">Headsets</a>
        <a href="/collections/iems-1" style="color:#eee;text-decoration:none;font-size:14px;">IEMs</a>
        <a href="/collections/controllers" style="color:#eee;text-decoration:none;font-size:14px;">Controllers</a>
        <a href="/blog" style="color:#eee;text-decoration:none;font-size:14px;">Blog</a>
        <a href="/about" style="color:#eee;text-decoration:none;font-size:14px;">About</a>
        <a href="/contact" style="color:#eee;text-decoration:none;font-size:14px;">Contact</a>
        <a href="/faq" style="color:#eee;text-decoration:none;font-size:14px;">FAQ</a>
      </nav>
    </header>

    <main style="max-width:1200px;margin:0 auto;padding:40px 20px;color:#eee;">
      <!-- Hero Banner Section -->
      <section style="text-align:center;padding:20px 0 40px 0;" aria-label="Hero Section">
        <div style="display:inline-block;background:rgba(192,254,45,0.12);color:#C0FE2D;border:1px solid rgba(192,254,45,0.3);font-size:12px;font-weight:700;padding:6px 16px;border-radius:999px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">
          Pakistan's Premier Esports &amp; Gaming Gear Store
        </div>
        <h1 style="font-size:clamp(30px,4.5vw,48px);font-weight:900;color:#fff;line-height:1.2;margin:0 auto 18px;max-width:920px;">
          100% Original Gaming Hardware &amp; Tech Store Pakistan
        </h1>
        <p style="font-size:clamp(15px,2vw,18px);color:#aaa;max-width:780px;margin:0 auto 28px;line-height:1.6;">
          Pakistan's trusted destination for genuine mechanical keyboards, 8000Hz ultralight gaming mice, audiophile planar magnetic headsets, Hi-Res IEMs, and competitive esports gear. Sourced directly from authorized brand channels with nationwide Cash on Delivery and official manufacturer warranty.
        </p>
        <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
          <a href="/shop" style="background:#C0FE2D;color:#111;font-weight:800;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:15px;">
            Explore All Hardware &rarr;
          </a>
          <a href="/collections" style="background:#222;color:#fff;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:15px;border:1px solid #333;">
            Browse All Collections
          </a>
        </div>
      </section>

      <!-- Promotional Notification Marquee -->
      <section style="background:#181818;border:1px solid #262626;border-radius:12px;padding:16px 20px;margin-bottom:40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;font-weight:700;color:#fff;">
          <span style="background:#25D366;color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;">WHATSAPP</span>
          <span>EXPRESS NATIONWIDE SHIPPING — Re-Confirm Availability: <a href="https://wa.me/923375799958" style="color:#C0FE2D;text-decoration:none;font-weight:800;">03375799958</a></span>
        </div>
        <div style="display:flex;gap:16px;font-size:12px;color:#aaa;">
          <span>✓ 100% Genuine</span>
          <span>✓ Official Warranty</span>
          <span>✓ Cash on Delivery</span>
        </div>
      </section>

      <!-- Trending Categories Section -->
      <section style="margin-bottom:48px;" aria-labelledby="trending-categories-heading">
        <h2 id="trending-categories-heading" style="font-size:22px;font-weight:800;color:#fff;margin-bottom:18px;">Trending Hardware Categories</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
          <a href="/collections/headsets" style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;text-decoration:none;color:#fff;text-align:center;">
            <h3 style="color:#C0FE2D;margin:0 0 6px 0;font-size:17px;font-weight:800;">Esports Headsets</h3>
            <p style="color:#aaa;font-size:12px;margin:0;">Spatial Audio, Planar Magnetic, Low-Latency Wireless</p>
          </a>
          <a href="/collections/keyboard" style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;text-decoration:none;color:#fff;text-align:center;">
            <h3 style="color:#C0FE2D;margin:0 0 6px 0;font-size:17px;font-weight:800;">Mechanical Keyboards</h3>
            <p style="color:#aaa;font-size:12px;margin:0;">Rapid Trigger, Hall Effect Magnetic, Gasket Mounts</p>
          </a>
          <a href="/collections/mouse" style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;text-decoration:none;color:#fff;text-align:center;">
            <h3 style="color:#C0FE2D;margin:0 0 6px 0;font-size:17px;font-weight:800;">Gaming Mice</h3>
            <p style="color:#aaa;font-size:12px;margin:0;">Ultralight, 8000Hz Polling Rate, PAW3395 Sensors</p>
          </a>
          <a href="/collections/mic" style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;text-decoration:none;color:#fff;text-align:center;">
            <h3 style="color:#C0FE2D;margin:0 0 6px 0;font-size:17px;font-weight:800;">Studio Microphones</h3>
            <p style="color:#aaa;font-size:12px;margin:0;">USB &amp; XLR Studio Streaming Condensers</p>
          </a>
          <a href="/collections/gaming-chairs" style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;text-decoration:none;color:#fff;text-align:center;">
            <h3 style="color:#C0FE2D;margin:0 0 6px 0;font-size:17px;font-weight:800;">Gaming Chairs</h3>
            <p style="color:#aaa;font-size:12px;margin:0;">Ergonomic Lumbar Support &amp; Premium Foam</p>
          </a>
          <a href="/collections/iems-1" style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;text-decoration:none;color:#fff;text-align:center;">
            <h3 style="color:#C0FE2D;margin:0 0 6px 0;font-size:17px;font-weight:800;">Hi-Res IEMs</h3>
            <p style="color:#aaa;font-size:12px;margin:0;">Studio In-Ear Monitors &amp; Silver Plated Cables</p>
          </a>
          <a href="/collections/accessories" style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;text-decoration:none;color:#fff;text-align:center;">
            <h3 style="color:#C0FE2D;margin:0 0 6px 0;font-size:17px;font-weight:800;">Battlestation Gear</h3>
            <p style="color:#aaa;font-size:12px;margin:0;">Mouse Pads, Monitor Arms, Coiled Cables &amp; Stands</p>
          </a>
          <a href="/collections/controllers" style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;text-decoration:none;color:#fff;text-align:center;">
            <h3 style="color:#C0FE2D;margin:0 0 6px 0;font-size:17px;font-weight:800;">Controllers</h3>
            <p style="color:#aaa;font-size:12px;margin:0;">Hall Effect Wireless PC &amp; Console Gamepads</p>
          </a>
        </div>
      </section>

      <!-- Featured Products Section -->
      <section style="margin-bottom:48px;" aria-labelledby="featured-products-heading">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
          <div>
            <span style="font-size:11px;font-mono;font-weight:700;color:#C0FE2D;text-transform:uppercase;letter-spacing:1px;background:rgba(192,254,45,0.1);padding:3px 8px;border-radius:4px;border:1px solid rgba(192,254,45,0.25);">FLAGSHIP GEAR</span>
            <h2 id="featured-products-heading" style="font-size:24px;font-weight:800;color:#fff;margin:6px 0 4px 0;">Featured Gaming Hardware</h2>
            <p style="color:#aaa;font-size:14px;margin:0;">Top performing authentic gaming hardware and high-precision peripherals.</p>
          </div>
          <a href="/shop" style="color:#C0FE2D;font-weight:700;font-size:14px;text-decoration:none;">View All Products &rarr;</a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;">
          ${featuredProductsHtml}
        </div>
      </section>

      <!-- Flash Sale Hardware Section -->
      ${
        flashDeals.length > 0
          ? `
        <section style="margin-bottom:48px;" aria-labelledby="flash-deals-heading">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
            <div>
              <span style="font-size:11px;font-mono;font-weight:700;color:#ff7675;text-transform:uppercase;letter-spacing:1px;background:rgba(255,118,117,0.1);padding:3px 8px;border-radius:4px;border:1px solid rgba(255,118,117,0.25);">LIMITED TIME OFFERS</span>
              <h2 id="flash-deals-heading" style="font-size:24px;font-weight:800;color:#fff;margin:6px 0 4px 0;">Flash Sale Hardware</h2>
              <p style="color:#aaa;font-size:14px;margin:0;">Exclusive price drops on authentic gaming gear with live Shopify inventory.</p>
            </div>
            <a href="/sale" style="color:#C0FE2D;font-weight:700;font-size:14px;text-decoration:none;">View All Deals &rarr;</a>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;">
            ${flashDealsHtml}
          </div>
        </section>
      `
          : ""
      }

      <!-- Dynamic Shopify Collection Product Carousels -->
      ${collectionSectionsHtml}

      <!-- Why Choose Us Trust Section -->
      <section style="margin-bottom:48px;background:#181818;border:1px solid #262626;border-radius:16px;padding:36px 24px;" aria-labelledby="why-choose-heading">
        <h2 id="why-choose-heading" style="font-size:24px;font-weight:800;color:#fff;margin-bottom:8px;text-align:center;">Why Choose TheReviveTech</h2>
        <p style="color:#aaa;font-size:14px;text-align:center;max-width:600px;margin:0 auto 28px;line-height:1.5;">Industry-leading warranties, zero-risk returns, and direct official brand support across Pakistan.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;">
          <div style="text-align:center;">
            <div style="color:#C0FE2D;font-size:24px;margin-bottom:8px;">🚚</div>
            <h3 style="color:#fff;font-size:16px;font-weight:700;margin:0 0 6px 0;">Express Nationwide Delivery</h3>
            <p style="color:#aaa;font-size:13px;line-height:1.6;margin:0;">Fast, tracked courier shipping to Karachi, Lahore, Islamabad, and all cities across Pakistan.</p>
          </div>
          <div style="text-align:center;">
            <div style="color:#C0FE2D;font-size:24px;margin-bottom:8px;">🛡️</div>
            <h3 style="color:#fff;font-size:16px;font-weight:700;margin:0 0 6px 0;">100% Authentic Products</h3>
            <p style="color:#aaa;font-size:13px;line-height:1.6;margin:0;">Every unit has verifiable serial numbers that register on official manufacturer software. Zero fakes.</p>
          </div>
          <div style="text-align:center;">
            <div style="color:#C0FE2D;font-size:24px;margin-bottom:8px;">🔄</div>
            <h3 style="color:#fff;font-size:16px;font-weight:700;margin:0 0 6px 0;">30-Day Money Back</h3>
            <p style="color:#aaa;font-size:13px;line-height:1.6;margin:0;">Try your gear risk-free with official local warranty and hassle-free return support.</p>
          </div>
          <div style="text-align:center;">
            <div style="color:#C0FE2D;font-size:24px;margin-bottom:8px;">🎧</div>
            <h3 style="color:#fff;font-size:16px;font-weight:700;margin:0 0 6px 0;">24/7 Gamer Support</h3>
            <p style="color:#aaa;font-size:13px;line-height:1.6;margin:0;">Direct hardware specialist guidance for switch tuning, polling rates, and firmware updates.</p>
          </div>
        </div>
      </section>

      <!-- Customer Reviews Section -->
      <section style="margin-bottom:48px;" aria-labelledby="customer-reviews-heading">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
          <div>
            <span style="font-size:12px;font-mono;color:#C0FE2D;font-weight:700;">★ ★ ★ ★ ★ 4.9 / 5.0 VERIFIED RATINGS</span>
            <h2 id="customer-reviews-heading" style="font-size:24px;font-weight:800;color:#fff;margin:6px 0 4px 0;">Customer Feedback</h2>
            <p style="color:#aaa;font-size:13px;margin:0;">Verified buyer ratings directly from tech enthusiasts across Pakistan.</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;">
          <div style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;">
            <div style="color:#f39c12;margin-bottom:8px;">★★★★★</div>
            <p style="color:#eee;font-size:14px;line-height:1.6;margin:0 0 12px 0;">&ldquo;Ordered IEMs and gaming mouse pad. Received 100% authentic original products within 2 days in Lahore. Outstanding packaging!&rdquo;</p>
            <div style="color:#C0FE2D;font-weight:700;font-size:13px;">Ahmad Raza — Lahore</div>
          </div>
          <div style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;">
            <div style="color:#f39c12;margin-bottom:8px;">★★★★★</div>
            <p style="color:#eee;font-size:14px;line-height:1.6;margin:0 0 12px 0;">&ldquo;The Revive Tech is the best place in Pakistan for genuine gaming gear. Bought Edifier speakers and Nanoleaf light panels. Super fast response!&rdquo;</p>
            <div style="color:#C0FE2D;font-weight:700;font-size:13px;">Zain Ul Abideen — Karachi</div>
          </div>
          <div style="background:#181818;border:1px solid #262626;border-radius:12px;padding:20px;">
            <div style="color:#f39c12;margin-bottom:8px;">★★★★★</div>
            <p style="color:#eee;font-size:14px;line-height:1.6;margin:0 0 12px 0;">&ldquo;Great customer service and official brand warranty support. EasySMX controller works flawlessly with PC and Switch.&rdquo;</p>
            <div style="color:#C0FE2D;font-weight:700;font-size:13px;">Hamza Malik — Islamabad</div>
          </div>
        </div>
      </section>

      <!-- Recent Blog Guides Section -->
      ${
        articles.length > 0
          ? `
        <section style="margin-bottom:48px;" aria-labelledby="recent-articles-heading">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
            <div>
              <span style="font-size:11px;font-mono;font-weight:700;color:#C0FE2D;text-transform:uppercase;letter-spacing:1px;background:rgba(192,254,45,0.1);padding:3px 8px;border-radius:4px;border:1px solid rgba(192,254,45,0.25);">TECH INSIGHTS</span>
              <h2 id="recent-articles-heading" style="font-size:24px;font-weight:800;color:#fff;margin:6px 0 4px 0;">Hardware Guides &amp; Reviews</h2>
              <p style="color:#aaa;font-size:14px;margin:0;">Tech guides, setup reviews, and industry insights from our gaming lab.</p>
            </div>
            <a href="/blog" style="color:#C0FE2D;font-weight:700;font-size:14px;text-decoration:none;">View All Blogs (${articles.length}) &rarr;</a>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;">
            ${articlesHtml}
          </div>
        </section>
      `
          : ""
      }

      <!-- FAQ Section -->
      <section style="margin-bottom:48px;" aria-labelledby="faq-heading">
        <h2 id="faq-heading" style="font-size:24px;font-weight:800;color:#fff;margin-bottom:8px;text-align:center;">Frequently Asked Questions</h2>
        <p style="color:#aaa;font-size:14px;text-align:center;max-width:600px;margin:0 auto 28px;line-height:1.5;">Answers to common questions about authenticity, shipping timelines, warranties, and payment methods.</p>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div style="background:#181818;border:1px solid #262626;border-radius:10px;padding:18px 22px;">
            <h3 style="color:#fff;font-size:16px;margin:0 0 8px 0;font-weight:700;">How does TheReviveTech ensure 100% authentic products?</h3>
            <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0;">All items in our store are sourced directly from authorized brand distributors with verified serial numbers that can be registered on official manufacturer software. We guarantee 100% genuine hardware with official local warranty support.</p>
          </div>
          <div style="background:#181818;border:1px solid #262626;border-radius:10px;padding:18px 22px;">
            <h3 style="color:#fff;font-size:16px;margin:0 0 8px 0;font-weight:700;">What is 8000Hz HyperPolling and does my computer support it?</h3>
            <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0;">8000Hz polling sends 8,000 motion updates per second to your CPU (0.125ms delay). It is recommended for monitors running at 240Hz, 360Hz, or higher paired with modern Intel Core i7/i9 or AMD Ryzen 7/9 processors.</p>
          </div>
          <div style="background:#181818;border:1px solid #262626;border-radius:10px;padding:18px 22px;">
            <h3 style="color:#fff;font-size:16px;margin:0 0 8px 0;font-weight:700;">What warranty coverage is included with hardware purchases?</h3>
            <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0;">All products sold by The Revive Tech are 100% genuine with official brand warranty support. Specific warranty periods and replacement details are stated on individual product listings.</p>
          </div>
          <div style="background:#181818;border:1px solid #262626;border-radius:10px;padding:18px 22px;">
            <h3 style="color:#fff;font-size:16px;margin:0 0 8px 0;font-weight:700;">How fast is express shipping across Pakistan?</h3>
            <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0;">Orders placed before 2 PM PST are dispatched same-day from our Lahore fulfillment hub. Express domestic shipping takes 1-2 business days with full real-time courier tracking codes sent via SMS and email.</p>
          </div>
          <div style="background:#181818;border:1px solid #262626;border-radius:10px;padding:18px 22px;">
            <h3 style="color:#fff;font-size:16px;margin:0 0 8px 0;font-weight:700;">Is Cash on Delivery (COD) available?</h3>
            <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0;">Yes, we offer Cash on Delivery nationwide for all verified domestic orders across Pakistan, along with Debit/Credit cards, JazzCash, EasyPaisa, and Bank Transfer.</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Site Footer -->
    <footer class="trt-ssr-footer" style="background:#0c0c0c;border-top:1px solid #222;padding:40px 24px 24px;margin-top:48px;color:#888;font-size:13px;line-height:1.6;">
      <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:28px;">
        <div>
          <h4 style="color:#fff;margin-bottom:12px;font-size:15px;font-weight:800;">The Revive Tech</h4>
          <p>Pakistan's Premier Destination for Original Gaming Peripherals &amp; High-Performance Computer Hardware.</p>
          <p style="margin-top:8px;">Commercial Market, 96-D, Block D, DHA EME Sector, Lahore, Pakistan</p>
          <p style="margin-top:6px;color:#C0FE2D;">Phone: +92-347-5799958 • Email: therevivetech@gmail.com</p>
        </div>
        <div>
          <h4 style="color:#fff;margin-bottom:12px;font-size:15px;font-weight:800;">Hardware Categories</h4>
          <ul style="list-style:none;padding:0;margin:0;line-height:2.1;">
            <li><a href="/collections/keyboard" style="color:#aaa;text-decoration:none;">Mechanical Keyboards</a></li>
            <li><a href="/collections/mouse" style="color:#aaa;text-decoration:none;">Gaming Mice</a></li>
            <li><a href="/collections/headsets" style="color:#aaa;text-decoration:none;">Esports Headsets</a></li>
            <li><a href="/collections/iems-1" style="color:#aaa;text-decoration:none;">Hi-Res IEMs &amp; Audio</a></li>
            <li><a href="/collections/controllers" style="color:#aaa;text-decoration:none;">Wireless Controllers</a></li>
            <li><a href="/collections/gaming-chairs" style="color:#aaa;text-decoration:none;">Ergonomic Chairs</a></li>
            <li><a href="/collections/accessories" style="color:#aaa;text-decoration:none;">Battlestation Accessories</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;margin-bottom:12px;font-size:15px;font-weight:800;">Customer Support</h4>
          <ul style="list-style:none;padding:0;margin:0;line-height:2.1;">
            <li><a href="/contact" style="color:#aaa;text-decoration:none;">Contact Us</a></li>
            <li><a href="/faq" style="color:#aaa;text-decoration:none;">Warranty &amp; Shipping FAQ</a></li>
            <li><a href="/about" style="color:#aaa;text-decoration:none;">About Our Store</a></li>
            <li><a href="/blog" style="color:#aaa;text-decoration:none;">Hardware Guides &amp; Reviews</a></li>
            <li><a href="/terms-of-service" style="color:#aaa;text-decoration:none;">Terms of Service</a></li>
            <li><a href="/privacy-policy" style="color:#aaa;text-decoration:none;">Privacy Policy</a></li>
            <li><a href="/refund-policy" style="color:#aaa;text-decoration:none;">Refund Policy</a></li>
            <li><a href="/shipping-policy" style="color:#aaa;text-decoration:none;">Shipping Policy</a></li>
          </ul>
        </div>
      </div>
      <div style="max-width:1200px;margin:32px auto 0;padding-top:20px;border-top:1px solid #1a1a1a;text-align:center;color:#666;font-size:12px;">
        &copy; 2026 The Revive Tech. All rights reserved. 100% Genuine Tech Store Pakistan.
      </div>
    </footer>
  `;
}
