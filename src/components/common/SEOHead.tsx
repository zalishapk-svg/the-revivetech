import React, { useEffect } from "react";
import { useShopify } from "../../context/ShopifyContext";

export const SEOHead: React.FC = () => {
  const { viewState, products, collections, articles } = useShopify();

  useEffect(() => {
    const origin = window.location.origin || "https://therevivetech.pk";
    let title = "The Revive Tech | Original Gaming Hardware & Gear in Pakistan";
    let description = "Buy 100% original gaming headsets, mechanical keyboards, mice, audio gear and accessories in Pakistan with fast nationwide delivery and cash on delivery.";
    let image = `${origin}/og-image.png`;
    let canonical = `${origin}${window.location.pathname}`;
    let ogType = "website";
    let jsonLd: any = null;

    const currentType = viewState.type;

    if (currentType === "home") {
      title = "The Revive Tech | Original Gaming Hardware & Tech Store Pakistan";
      description = "Shop 100% genuine gaming keyboards, wireless headsets, ultralight mice, and PC accessories in Pakistan at unbeatable prices with nationwide Cash on Delivery.";
      canonical = `${origin}/`;
    } else if (currentType === "shop") {
      title = "Shop All Gaming Hardware & Accessories | The Revive Tech";
      description = "Explore our complete inventory of mechanical keyboards, gaming headsets, mice, and computer hardware in Pakistan.";
      canonical = `${origin}/shop`;
    } else if (currentType === "collections_list") {
      title = "Gaming Hardware Collections | The Revive Tech";
      description = "Browse official gaming hardware collections including Keyboards, Headsets, Mice, Audio, and Accessories.";
      canonical = `${origin}/collections`;
    } else if (currentType === "collection") {
      const handle = "handle" in viewState ? viewState.handle : "";
      const col = collections.find((c) => c.handle === handle);
      const colTitle = col?.title || handle.replace(/-/g, " ").toUpperCase();
      title = `${colTitle} Collection | The Revive Tech Pakistan`;
      description = col?.description ? col.description.slice(0, 160) : `Shop official ${colTitle} gaming gear at The Revive Tech with fast delivery across Pakistan.`;
      image = col?.image?.url || image;
      canonical = `${origin}/collections/${handle}`;
    } else if (currentType === "product") {
      const handle = "handle" in viewState ? viewState.handle : "";
      const product = products.find((p) => p.handle === handle);
      if (product) {
        title = `${product.title} | The Revive Tech`;
        description = product.description ? product.description.slice(0, 160) : `Buy original ${product.title} in Pakistan at best price.`;
        image = product.featuredImage?.url || image;
        canonical = `${origin}/products/${handle}`;
        ogType = "og:product";

        jsonLd = {
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.title,
          "image": [product.featuredImage?.url || image],
          "description": product.description || description,
          "sku": product.variants?.[0]?.sku || product.id,
          "brand": {
            "@type": "Brand",
            "name": product.vendor || "The Revive Tech",
          },
          "offers": {
            "@type": "Offer",
            "url": canonical,
            "priceCurrency": product.priceRange?.minVariantPrice?.currencyCode || "PKR",
            "price": product.priceRange?.minVariantPrice?.amount || "0.00",
            "availability": product.availableForSale
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "The Revive Tech",
            },
          },
        };
      } else {
        title = `Product | The Revive Tech`;
        canonical = `${origin}/products/${handle}`;
      }
    } else if (currentType === "cart") {
      title = "Your Shopping Cart | The Revive Tech";
      description = "Review items in your shopping cart before secure checkout.";
      canonical = `${origin}/cart`;
    } else if (currentType === "search") {
      const query = "query" in viewState ? viewState.query : "";
      title = query ? `Search Results for "${query}" | The Revive Tech` : "Search Hardware | The Revive Tech";
      canonical = `${origin}/search`;
    } else if (currentType === "about") {
      title = "About Us | The Revive Tech";
      description = "Learn about The Revive Tech — Pakistan's premier destination for original gaming gear and technology hardware.";
      canonical = `${origin}/about`;
    } else if (currentType === "contact") {
      title = "Contact Us & Support | The Revive Tech";
      description = "Get in touch with The Revive Tech team for order assistance, product availability, or bulk sales in Pakistan.";
      canonical = `${origin}/contact`;
    } else if (currentType === "faq") {
      title = "Frequently Asked Questions (FAQ) | The Revive Tech";
      description = "Find answers regarding shipping, Cash on Delivery, warranty, returns, and order verification.";
      canonical = `${origin}/faq`;
    } else if (currentType === "blog") {
      title = "Hardware Blog & Reviews | The Revive Tech";
      description = "Read expert gaming hardware guides, mechanical keyboard switch breakdowns, and tech reviews.";
      canonical = `${origin}/blog`;
    } else if (currentType === "article") {
      const handle = "handle" in viewState ? viewState.handle : "";
      const art = articles.find((a) => a.handle === handle);
      title = art ? `${art.title} | The Revive Tech Blog` : "Blog Article | The Revive Tech";
      description = art?.excerpt || description;
      image = art?.image?.url || image;
      canonical = `${origin}/blog/${handle}`;
      ogType = "article";
    }

    // Update document title
    document.title = title;

    // Helper function to set or create meta tags
    const setMetaTag = (selector: string, attr: "name" | "property", attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMetaTag('meta[name="description"]', "name", "description", description);

    // Open Graph
    setMetaTag('meta[property="og:title"]', "property", "og:title", title);
    setMetaTag('meta[property="og:description"]', "property", "og:description", description);
    setMetaTag('meta[property="og:image"]', "property", "og:image", image);
    setMetaTag('meta[property="og:url"]', "property", "og:url", canonical);
    setMetaTag('meta[property="og:type"]', "property", "og:type", ogType);
    setMetaTag('meta[property="og:site_name"]', "property", "og:site_name", "The Revive Tech");

    // Twitter
    setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", image);

    // Link Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonical);

    // JSON-LD Script
    let jsonLdScript = document.querySelector('script[id="seo-jsonld"]');
    if (jsonLd) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement("script");
        jsonLdScript.setAttribute("id", "seo-jsonld");
        jsonLdScript.setAttribute("type", "application/ld+json");
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }
  }, [viewState, products, collections, articles]);

  return null;
};
