import fs from "fs";
import path from "path";
import {
  fetchHomepageDataFromShopify,
  buildHomepageSemanticHtml,
} from "../api/_lib/homepage-html-generator.js";

async function prerenderHomepage() {
  console.log("[Prerender Homepage] Fetching live Shopify homepage catalog...");

  try {
    const homeData = await fetchHomepageDataFromShopify();
    console.log(
      `[Prerender Homepage] Retrieved ${homeData.featuredProducts.length} featured products, ${homeData.collections.length} collections, ${homeData.flashDeals.length} deals, ${homeData.articles.length} articles.`
    );

    const crawlableHtml = buildHomepageSemanticHtml(homeData);

    // Target files to inject pre-rendered content into
    const filesToUpdate = [
      path.join(process.cwd(), "index.html"),
      path.join(process.cwd(), "dist", "index.html"),
    ];

    const rootRegex = /<div\s+id=["']root["']>[\s\S]*?<\/div>(?=\s*(?:<script|<\/body>))/i;

    for (const filePath of filesToUpdate) {
      if (!fs.existsSync(filePath)) continue;

      let content = fs.readFileSync(filePath, "utf-8");

      if (rootRegex.test(content)) {
        content = content.replace(
          rootRegex,
          `<div id="root">\n${crawlableHtml}\n    </div>`
        );
        fs.writeFileSync(filePath, content, "utf-8");
        console.log(`[Prerender Homepage] Injected semantic HTML into: ${filePath} (${content.length} bytes)`);
      } else if (/<div\s+id=["']root["']>\s*<\/div>/i.test(content)) {
        content = content.replace(
          /<div\s+id=["']root["']>\s*<\/div>/i,
          `<div id="root">\n${crawlableHtml}\n    </div>`
        );
        fs.writeFileSync(filePath, content, "utf-8");
        console.log(`[Prerender Homepage] Injected semantic HTML into empty root: ${filePath}`);
      }
    }
  } catch (err) {
    console.error("[Prerender Homepage] Error pre-rendering homepage:", err);
  }
}

prerenderHomepage();
