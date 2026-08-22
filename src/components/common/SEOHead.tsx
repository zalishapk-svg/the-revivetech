import React, { useEffect } from "react";
import { useShopify } from "../../context/ShopifyContext";

export const SEOHead: React.FC = () => {
  const { viewState, products, collections, articles } = useShopify();

  useEffect(() => {
    const origin = window.location.origin || "https://therevivetech.pk";
    let title = "The Revive Tech | Original Gaming Hardware & Tech Store Pakistan";
    let description = "Buy 100% original gaming headsets, mechanical keyboards, mice, audio gear and computer peripherals in Pakistan with fast nationwide delivery and cash on delivery.";
    let image = `${origin}/og-image.png`;
    let canonicalPath = window.location.pathname || "/";
    let searchParams = new URLSearchParams(window.location.search);
    let pageNum = searchParams.get("page");
    let isUtilityPage = false;
    let ogType = "website";
    let jsonLdSchemas: any[] = [];

    // Global Organization Schema
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      "name": "The Revive Tech",
      "url": origin,
      "logo": `${origin}/logo.png`,
      "description": "Pakistan's Premier Destination for Original Gaming Peripherals & High-Performance Computer Hardware.",
      "sameAs": [
        "https://facebook.com/therevivetech",
        "https://instagram.com/therevivetech"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "telephone": "+92-300-1234567",
        "areaServed": "PK",
        "availableLanguage": ["English", "Urdu"]
      }
    };

    // Global WebSite Schema for Sitelinks Searchbox
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      "url": origin,
      "name": "The Revive Tech",
      "publisher": { "@id": `${origin}/#organization` },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${origin}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    jsonLdSchemas.push(orgSchema, websiteSchema);

    const currentType = viewState.type;

    if (currentType === "home") {
      title = "The Revive Tech | Original Gaming Hardware & Tech Store Pakistan";
      description = "Shop 100% genuine gaming keyboards, wireless headsets, ultralight mice, and PC accessories in Pakistan at best prices with nationwide Cash on Delivery.";
      canonicalPath = "/";
    } else if (currentType === "shop" || currentType === "explore_all" || currentType === "sale") {
      title = currentType === "sale" 
        ? "On Sale Gaming Hardware & Discounted Gear | The Revive Tech"
        : "Shop All Gaming Hardware & Accessories | The Revive Tech";
      description = "Explore our complete inventory of mechanical keyboards, gaming headsets, 8000Hz gaming mice, and computer hardware in Pakistan with official warranty.";
      canonicalPath = "/shop";

      // Breadcrumbs for Shop
      jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
          { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${origin}/shop` }
        ]
      });
    } else if (currentType === "collections_list") {
      title = "Gaming Hardware Collections | The Revive Tech Pakistan";
      description = "Browse official gaming hardware collections including Mechanical Keyboards, Audiophile Headsets, Lightweight Mice, Audio, and Battlestation Accessories.";
      canonicalPath = "/collections";

      jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
          { "@type": "ListItem", "position": 2, "name": "Collections", "item": `${origin}/collections` }
        ]
      });
    } else if (currentType === "collection") {
      const handle = "handle" in viewState ? viewState.handle : "";
      const col = collections.find((c) => c.handle === handle);
      const colTitle = col?.title || handle.replace(/-/g, " ").toUpperCase();
      
      title = col?.seo?.title || `${colTitle} Collection | The Revive Tech Pakistan`;
      description = col?.seo?.description || (col?.description ? col.description.slice(0, 160) : `Shop official ${colTitle} gaming gear at The Revive Tech with fast nationwide delivery in Pakistan.`);
      image = col?.image?.url || image;
      canonicalPath = `/collections/${handle}`;

      // CollectionPage Schema
      jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${origin}${canonicalPath}`,
        "name": colTitle,
        "description": description,
        "url": `${origin}${canonicalPath}`,
        "image": image,
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": (col?.products || []).slice(0, 12).map((prod, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": `${origin}/products/${prod.handle}`
          }))
        }
      });

      // Breadcrumbs for Collection
      jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
          { "@type": "ListItem", "position": 2, "name": "Collections", "item": `${origin}/collections` },
          { "@type": "ListItem", "position": 3, "name": colTitle, "item": `${origin}${canonicalPath}` }
        ]
      });
    } else if (currentType === "product") {
      const handle = "handle" in viewState ? viewState.handle : "";
      const product = products.find((p) => p.handle === handle);
      if (product) {
        title = product.seo?.title || `${product.title} | The Revive Tech`;
        description = product.seo?.description || (product.description ? product.description.slice(0, 160) : `Buy original ${product.title} in Pakistan at best price with official warranty.`);
        image = product.featuredImage?.url || image;
        canonicalPath = `/products/${handle}`;
        ogType = "og:product";

        // Rich Product Schema for Google Rich Snippets
        const productSchema: any = {
          "@context": "https://schema.org/",
          "@type": "Product",
          "@id": `${origin}${canonicalPath}`,
          "name": product.title,
          "image": product.images?.map((img) => img.url) || [image],
          "description": product.description || description,
          "sku": product.variants?.[0]?.sku || product.id,
          "brand": {
            "@type": "Brand",
            "name": product.vendor || "The Revive Tech",
          },
          "offers": {
            "@type": "Offer",
            "url": `${origin}${canonicalPath}`,
            "priceCurrency": product.priceRange?.minVariantPrice?.currencyCode || "PKR",
            "price": product.priceRange?.minVariantPrice?.amount || "0.00",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.availableForSale
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "The Revive Tech",
            },
          },
        };

        // ONLY include AggregateRating if legitimate reviews exist!
        if (product.rating && product.reviewsCount && product.reviewsCount > 0) {
          productSchema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": Number(product.rating),
            "reviewCount": Number(product.reviewsCount),
            "bestRating": "5",
            "worstRating": "1"
          };
        }

        jsonLdSchemas.push(productSchema);

        // Product Breadcrumbs Schema
        jsonLdSchemas.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
            { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${origin}/shop` },
            { "@type": "ListItem", "position": 3, "name": product.title, "item": `${origin}${canonicalPath}` }
          ]
        });
      } else {
        title = `Product | The Revive Tech`;
        canonicalPath = `/products/${handle}`;
      }
    } else if (currentType === "about") {
      title = "About The Revive Tech | Premier Gaming Hardware Store Pakistan";
      description = "Learn about The Revive Tech — Pakistan's trusted destination for 100% original esports gear, custom mechanical keyboards, ultralight gaming mice, and computer peripherals based in Lahore.";
      canonicalPath = "/about";

      jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
          { "@type": "ListItem", "position": 2, "name": "About Us", "item": `${origin}/about` }
        ]
      });
    } else if (currentType === "contact") {
      title = "Contact Us & Customer Support | The Revive Tech Pakistan";
      description = "Get in touch with The Revive Tech team in Lahore for order status tracking, product availability inquiries, switch compatibility, or warranty claims via WhatsApp or phone.";
      canonicalPath = "/contact";

      jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "@id": `${origin}/contact`,
        "name": "Contact The Revive Tech",
        "description": description,
        "url": `${origin}/contact`,
        "mainEntity": {
          "@type": "Organization",
          "name": "The Revive Tech",
          "telephone": "+92-300-1234567",
          "email": "support@therevivetech.pk",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Commercial Market, 96-D, Block D, DHA EME Sector",
            "addressLocality": "Lahore",
            "addressRegion": "Punjab",
            "postalCode": "54000",
            "addressCountry": "PK"
          }
        }
      });

      jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
          { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": `${origin}/contact` }
        ]
      });
    } else if (currentType === "faq") {
      title = "Frequently Asked Questions (FAQ) | Warranty & Shipping | The Revive Tech";
      description = "Find clear answers regarding Cash on Delivery, official brand warranty claims, express delivery timelines across Pakistan, order cancellation, and product authenticity.";
      canonicalPath = "/faq";

      // Rich FAQPage Schema for Search Snippets
      jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${origin}/faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does The Revive Tech ensure 100% authentic products in Pakistan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "All items in our store are sourced directly from authorized brand distributors with verified serial numbers that can be registered on official manufacturer software. We guarantee 100% genuine hardware with official local warranty support."
            }
          },
          {
            "@type": "Question",
            "name": "What payment methods are accepted for orders?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We accept Visa & Mastercard Credit/Debit Cards, Direct Bank Transfers, and mobile payment wallets (JazzCash & EasyPaisa) with 256-bit encrypted checkout security."
            }
          },
          {
            "@type": "Question",
            "name": "What warranty coverage is provided on products?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Warranties vary depending on the product type, brand, and manufacturer. Specific warranty terms and coverage periods are listed on each product's details page. All products are 100% genuine and backed by official brand warranty support."
            }
          },
          {
            "@type": "Question",
            "name": "How fast is express shipping for hardware orders?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Orders placed before 2 PM PST are dispatched same-day from our Lahore fulfillment hub. Express domestic shipping takes 1-2 business days with full real-time courier tracking codes sent via SMS and email."
            }
          }
        ]
      });

      jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
          { "@type": "ListItem", "position": 2, "name": "FAQ", "item": `${origin}/faq` }
        ]
      });
    } else if (currentType === "blog") {
      title = "Gaming Tech Blog & Hardware Guides | The Revive Tech";
      description = "Read expert gaming hardware guides, mechanical keyboard switch breakdowns, display refresh rate comparisons, and tech reviews by Pakistani hardware enthusiasts.";
      canonicalPath = "/blog";

      jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${origin}/blog` }
        ]
      });
    } else if (currentType === "article") {
      const handle = "handle" in viewState ? viewState.handle : "";
      const art = articles.find((a) => a.handle === handle);
      title = art?.seo?.title || (art ? `${art.title} | The Revive Tech Blog` : "Blog Article | The Revive Tech");
      description = art?.seo?.description || art?.excerpt || description;
      image = art?.image?.url || image;
      canonicalPath = `/blog/${handle}`;
      ogType = "article";

      if (art) {
        // Article / BlogPosting Schema
        jsonLdSchemas.push({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${origin}${canonicalPath}`,
          "headline": art.title,
          "description": description,
          "image": [image],
          "datePublished": art.publishedAt,
          "author": {
            "@type": "Person",
            "name": art.author || "The Revive Tech Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "The Revive Tech",
            "logo": {
              "@type": "ImageObject",
              "url": `${origin}/logo.png`
            }
          }
        });

        // Article Breadcrumb Schema
        jsonLdSchemas.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${origin}/blog` },
            { "@type": "ListItem", "position": 3, "name": art.title, "item": `${origin}${canonicalPath}` }
          ]
        });
      }
    } else if (currentType === "search") {
      isUtilityPage = true;
      const query = "query" in viewState ? viewState.query : "";
      title = query ? `Search Results for "${query}" | The Revive Tech` : "Search Gaming Hardware | The Revive Tech";
      canonicalPath = "/search";
    } else if (currentType === "cart") {
      isUtilityPage = true;
      title = "Shopping Cart | The Revive Tech";
      description = "Review items in your shopping cart before proceeding to secure checkout.";
      canonicalPath = "/cart";
    } else if (currentType === "account") {
      isUtilityPage = true;
      title = "My Account & Orders | The Revive Tech";
      description = "Manage your account, order history, tracking details, and saved delivery addresses.";
      canonicalPath = "/account";
    } else if (currentType === "page") {
      const handle = "handle" in viewState ? viewState.handle : "";
      title = `${handle.replace(/-/g, " ").toUpperCase()} | The Revive Tech`;
      canonicalPath = `/${handle}`;
    }

    // Handle Pagination Cleanly (Prevent duplicate canonicals & filter parameters bloat)
    let fullCanonical = `${origin}${canonicalPath}`;
    if (pageNum && Number(pageNum) > 1) {
      fullCanonical = `${origin}${canonicalPath}?page=${pageNum}`;
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

    // Robots Meta Tag (Utility pages use noindex, follow; content pages use index, follow)
    const robotsContent = isUtilityPage ? "noindex, follow" : "index, follow";
    setMetaTag('meta[name="robots"]', "name", "robots", robotsContent);

    // Standard Meta Description
    setMetaTag('meta[name="description"]', "name", "description", description);

    // Open Graph Tags
    setMetaTag('meta[property="og:title"]', "property", "og:title", title);
    setMetaTag('meta[property="og:description"]', "property", "og:description", description);
    setMetaTag('meta[property="og:image"]', "property", "og:image", image);
    setMetaTag('meta[property="og:url"]', "property", "og:url", fullCanonical);
    setMetaTag('meta[property="og:type"]', "property", "og:type", ogType);
    setMetaTag('meta[property="og:site_name"]', "property", "og:site_name", "The Revive Tech");

    // Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", image);

    // Link Canonical Tag
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", fullCanonical);

    // Pagination Link Rel Prev / Next
    let linkPrev = document.querySelector('link[rel="prev"]');
    let linkNext = document.querySelector('link[rel="next"]');
    
    if (pageNum && Number(pageNum) > 1) {
      const prevPage = Number(pageNum) - 1;
      const prevUrl = prevPage === 1 ? `${origin}${canonicalPath}` : `${origin}${canonicalPath}?page=${prevPage}`;
      if (!linkPrev) {
        linkPrev = document.createElement("link");
        linkPrev.setAttribute("rel", "prev");
        document.head.appendChild(linkPrev);
      }
      linkPrev.setAttribute("href", prevUrl);
    } else if (linkPrev) {
      linkPrev.remove();
    }

    // Next page link setup
    if (pageNum) {
      const nextPage = Number(pageNum) + 1;
      const nextUrl = `${origin}${canonicalPath}?page=${nextPage}`;
      if (!linkNext) {
        linkNext = document.createElement("link");
        linkNext.setAttribute("rel", "next");
        document.head.appendChild(linkNext);
      }
      linkNext.setAttribute("href", nextUrl);
    } else if (linkNext) {
      linkNext.remove();
    }

    // Inject JSON-LD Scripts dynamically into DOM
    let jsonLdScript = document.querySelector('script[id="seo-jsonld"]');
    if (jsonLdSchemas.length > 0) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement("script");
        jsonLdScript.setAttribute("id", "seo-jsonld");
        jsonLdScript.setAttribute("type", "application/ld+json");
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(jsonLdSchemas);
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }
  }, [viewState, products, collections, articles]);

  return null;
};

