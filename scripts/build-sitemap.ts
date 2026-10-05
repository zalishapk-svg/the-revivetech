import fs from "fs";
import path from "path";
import { generateSitemapXml } from "../api/_lib/sitemap-generator.js";

async function main() {
  console.log("[Build Sitemap] Generating production XML sitemap...");
  try {
    const xml = await generateSitemapXml(true);
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const sitemapPath = path.join(publicDir, "sitemap.xml");
    fs.writeFileSync(sitemapPath, xml, "utf-8");
    console.log(`[Build Sitemap] Successfully wrote sitemap.xml to ${sitemapPath} (${xml.length} bytes)`);
  } catch (err) {
    console.warn("[Build Sitemap] Warning: Could not generate dynamic catalog sitemap during build:", err);
    // Write fallback minimal valid sitemap
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const today = new Date().toISOString().split("T")[0];
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://www.therevivetech.pk/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>\n  <url><loc>https://www.therevivetech.pk/shop</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>\n  <url><loc>https://www.therevivetech.pk/collections</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>\n  <url><loc>https://www.therevivetech.pk/blog</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>\n</urlset>`;
    fs.writeFileSync(path.join(publicDir, "sitemap.xml"), fallbackXml, "utf-8");
  }
}

main();
