import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig, STABLE_STOREFRONT_API_VERSION } from "./_lib/shopify-server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host || "therevivetech.pk";
  const protocol = (req.headers["x-forwarded-proto"] as string) || "https";
  const baseUrl = `${protocol}://${host}`;

  const staticRoutes = [
    "",
    "/shop",
    "/collections",
    "/about",
    "/contact",
    "/blog",
    "/faq",
    "/cart",
    "/search",
  ];

  let collectionHandles: string[] = [];
  let productHandles: string[] = [];

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
      query getSitemapData {
        collections(first: 50) {
          edges { node { handle } }
        }
        products(first: 100) {
          edges { node { handle } }
        }
      }
    `;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data?.collections?.edges) {
        collectionHandles = data.data.collections.edges.map((e: any) => e.node.handle);
      }
      if (data.data?.products?.edges) {
        productHandles = data.data.products.edges.map((e: any) => e.node.handle);
      }
    }
  } catch (err) {
    console.error("Failed to fetch sitemap handles from Shopify:", err);
  }

  const currentDate = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${route === "" ? "daily" : "weekly"}</changefreq>\n`;
    xml += `    <priority>${route === "" ? "1.0" : "0.8"}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Collection pages
  for (const handle of collectionHandles) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/collections/${handle}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  // Product pages
  for (const handle of productHandles) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/products/${handle}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  return res.status(200).send(xml);
}
