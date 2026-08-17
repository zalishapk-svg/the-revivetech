import { Product, Collection, BlogArticle, Cart, CartLineItem, Customer } from "../types";

// GraphQL Query Strings for live Shopify Storefront API execution
export const STOREFRONT_QUERIES = {
  GET_PRODUCTS: `
    query getProducts($first: Int = 30, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          cursor
          node {
            id
            handle
            title
            description
            seo { title description }
            vendor
            productType
            tags
            availableForSale
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            compareAtPriceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            featuredImage { id url altText width height }
            images(first: 20) {
              edges { node { id url altText width height } }
            }
            options { id name values }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  sku
                  availableForSale
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
      }
    }
  `,

  GET_PRODUCT_BY_HANDLE: `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        seo { title description }
        vendor
        productType
        tags
        availableForSale
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        compareAtPriceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        featuredImage { id url altText width height }
        images(first: 30) {
          edges { node { id url altText width height } }
        }
        options { id name values }
        variants(first: 20) {
          edges {
            node {
              id
              title
              sku
              availableForSale
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              selectedOptions { name value }
            }
          }
        }
      }
    }
  `,

  GET_COLLECTIONS: `
    query getCollections($first: Int = 12, $after: String) {
      collections(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            handle
            title
            description
            seo { title description }
            image { id url altText }
            products(first: 8) {
              edges {
                node {
                  id
                  handle
                  title
                  description
                  vendor
                  productType
                  tags
                  availableForSale
                  priceRange {
                    minVariantPrice { amount currencyCode }
                    maxVariantPrice { amount currencyCode }
                  }
                  compareAtPriceRange {
                    minVariantPrice { amount currencyCode }
                    maxVariantPrice { amount currencyCode }
                  }
                  featuredImage { id url altText width height }
                  images(first: 20) {
                    edges { node { id url altText width height } }
                  }
                  options { id name values }
                  variants(first: 3) {
                    edges {
                      node {
                        id
                        title
                        sku
                        availableForSale
                        price { amount currencyCode }
                        compareAtPrice { amount currencyCode }
                        selectedOptions { name value }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,

  GET_COLLECTION_BY_HANDLE: `
    query getCollectionByHandle($handle: String!, $first: Int = 30, $after: String) {
      collection(handle: $handle) {
        id
        handle
        title
        description
        image { id url altText }
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              handle
              title
              description
              vendor
              productType
              tags
              availableForSale
              priceRange {
                minVariantPrice { amount currencyCode }
                maxVariantPrice { amount currencyCode }
              }
              compareAtPriceRange {
                minVariantPrice { amount currencyCode }
                maxVariantPrice { amount currencyCode }
              }
              featuredImage { id url altText width height }
              images(first: 20) {
                edges { node { id url altText width height } }
              }
              options { id name values }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    sku
                    availableForSale
                    price { amount currencyCode }
                    compareAtPrice { amount currencyCode }
                    selectedOptions { name value }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,

  GET_ARTICLES: `
    query getArticles($first: Int = 12, $after: String) {
      articles(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
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
            image { id url altText }
            tags
          }
        }
      }
    }
  `,

  GET_ARTICLE_BY_HANDLE: `
    query getArticleByHandle($handle: String!) {
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
            image { id url altText }
            tags
          }
        }
      }
    }
  `,

  CART_CREATE: `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount { amount currencyCode }
            totalAmount { amount currencyCode }
          }
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price { amount currencyCode }
                    product {
                      id
                      handle
                      title
                      featuredImage { id url altText }
                      vendor
                    }
                  }
                }
              }
            }
          }
        }
        userErrors { field message }
      }
    }
  `,

  CART_LINES_ADD: `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount { amount currencyCode }
            totalAmount { amount currencyCode }
          }
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price { amount currencyCode }
                    product {
                      id
                      handle
                      title
                      featuredImage { id url altText }
                      vendor
                    }
                  }
                }
              }
            }
          }
        }
        userErrors { field message }
      }
    }
  `,

  CART_LINES_UPDATE: `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount { amount currencyCode }
            totalAmount { amount currencyCode }
          }
        }
        userErrors { field message }
      }
    }
  `,

  CART_LINES_REMOVE: `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount { amount currencyCode }
            totalAmount { amount currencyCode }
          }
        }
        userErrors { field message }
      }
    }
  `,

  GET_CART: `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
        }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount currencyCode }
                  product {
                    id
                    handle
                    title
                    featuredImage { id url altText }
                    vendor
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
};


// Rich default Shopify Tech Data catalog representing live storefront items
export const MOCK_TECH_PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/1001",
    handle: "revive-apex-pro-wireless-mouse",
    title: "Revive Apex Pro Wireless Gaming Mouse",
    description: "Ultra-lightweight 49g wireless gaming mouse with 32,000 DPI Optical Sensor, 8000Hz polling rate, optical micro-switches, and zero latency carbon fiber chassis.",
    descriptionHtml: "<p>The <strong>Revive Apex Pro</strong> represents the absolute pinnacle of competitive peripheral engineering. Built with aerospace-grade carbon fiber composite weighing a microscopic 49 grams, it houses our proprietary 32K Optical Sensor for pixel-perfect tracking at ultra-high accelerations.</p><ul><li>32,000 DPI Optical Sensor with 750 IPS tracking</li><li>True 8000Hz Wireless Polling Rate via 2.4GHz Dongle</li><li>95 Hours Continuous Battery Life</li><li>PTFE Glides with zero friction resistance</li></ul>",
    vendor: "RazerTech",
    productType: "Gaming Mice",
    tags: ["Mice", "Wireless", "8000Hz", "Carbon Fiber", "Esports", "Best Seller", "New Drop"],
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "159.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "179.99", currencyCode: "USD" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "199.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "219.99", currencyCode: "USD" },
    },
    featuredImage: {
      id: "img1",
      url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80",
      altText: "Revive Apex Pro Wireless Gaming Mouse",
    },
    images: [
      { id: "img1", url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80", altText: "Main Angle" },
      { id: "img2", url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80", altText: "Side Profile" },
      { id: "img3", url: "https://images.unsplash.com/photo-1626218174358-7769486c4b79?auto=format&fit=crop&w=1200&q=80", altText: "Top Down View" },
    ],
    options: [
      { id: "opt1", name: "Color", values: ["Obsidian Black", "Arctic White", "Emerald Cyber"] },
      { id: "opt2", name: "Polling Rate", values: ["4000Hz Standard", "8000Hz HyperPolling"] },
    ],
    variants: [
      {
        id: "gid://shopify/ProductVariant/1001-1",
        title: "Obsidian Black / 8000Hz HyperPolling",
        sku: "TRT-MSE-APX-BLK-8K",
        availableForSale: true,
        price: { amount: "159.99", currencyCode: "USD" },
        compareAtPrice: { amount: "199.99", currencyCode: "USD" },
        selectedOptions: [{ name: "Color", value: "Obsidian Black" }, { name: "Polling Rate", value: "8000Hz HyperPolling" }],
      },
      {
        id: "gid://shopify/ProductVariant/1001-2",
        title: "Arctic White / 8000Hz HyperPolling",
        sku: "TRT-MSE-APX-WHT-8K",
        availableForSale: true,
        price: { amount: "169.99", currencyCode: "USD" },
        compareAtPrice: { amount: "209.99", currencyCode: "USD" },
        selectedOptions: [{ name: "Color", value: "Arctic White" }, { name: "Polling Rate", value: "8000Hz HyperPolling" }],
      },
    ],
    rating: 4.9,
    reviewsCount: 142,
    specs: {
      "Weight": "49 Grams",
      "Sensor": "Revive Sensor V3 32K DPI",
      "Switch Type": "Optical Gen-3 (90M Clicks)",
      "Battery Life": "Up to 95 Hours",
      "Connectivity": "2.4GHz Wireless / USB-C",
    },
    isBestSeller: true,
    isNewArrival: true,
    discountPercentage: 20,
    reviews: [
      { id: "r1", author: "Marcus K., CS2 Pro", rating: 5, title: "Unbelievable tracking precision", comment: "Switched from a competitor mouse and instantly felt the 49g lightness. The 8000Hz polling rate makes flick shots feel frictionless.", date: "2026-07-28", verified: true },
      { id: "r2", author: "Elena R.", rating: 5, title: "Best build quality on the market", comment: "Zero creaking or flex. The matte coating grip is phenomenal for palm and claw grip.", date: "2026-08-02", verified: true },
    ],
  },
  {
    id: "gid://shopify/ProductProduct/1002",
    handle: "revive-matrix-65-magnetic-keyboard",
    title: "Revive Matrix 65% Hall-Effect Magnetic Keyboard",
    description: "Rapid Trigger magnetic switch gaming keyboard with 0.1mm adjustable actuation, per-key RGB, gasket mount, CNC aluminum case, and web configurator.",
    descriptionHtml: "<p>Dominate movement in tactical shooters with the <strong>Revive Matrix 65%</strong>. Powered by Magnetic Hall-Effect switches featuring Rapid Trigger technology, key reset occurs instantaneously upon release.</p><ul><li>Rapid Trigger with 0.1mm - 4.0mm adjustable actuation point</li><li>Solid CNC Anodized Aluminum Enclosure with Brass Weight</li><li>Hot-swappable Magnetic Switches with factory lubrication</li><li>South-facing Per-Key RGB with 1000Hz/8000Hz Mode</li></ul>",
    vendor: "CorsairLabs",
    productType: "Gaming Keyboards",
    tags: ["Keyboards", "Rapid Trigger", "Magnetic Switches", "65%", "Aluminum", "New Drop"],
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "219.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "249.99", currencyCode: "USD" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "269.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "299.99", currencyCode: "USD" },
    },
    featuredImage: {
      id: "img1002",
      url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
      altText: "Revive Matrix 65 Magnetic Keyboard",
    },
    images: [
      { id: "img1002", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80", altText: "Keyboard Front" },
      { id: "img1002b", url: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80", altText: "Keycaps Close Up" },
      { id: "img1002c", url: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80", altText: "Aluminum Weight" },
    ],
    options: [
      { id: "optK1", name: "Case Color", values: ["Forest Stealth", "Silver Anodized", "E-White"] },
      { id: "optK2", name: "Keycap Profile", values: ["PBT Double-shot Cherry", "PBT Gradient Side-lit"] },
    ],
    variants: [
      {
        id: "gid://shopify/ProductVariant/1002-1",
        title: "Forest Stealth / PBT Double-shot Cherry",
        sku: "TRT-KBD-MTX-FST",
        availableForSale: true,
        price: { amount: "219.99", currencyCode: "USD" },
        compareAtPrice: { amount: "269.99", currencyCode: "USD" },
        selectedOptions: [{ name: "Case Color", value: "Forest Stealth" }, { name: "Keycap Profile", value: "PBT Double-shot Cherry" }],
      },
    ],
    rating: 5.0,
    reviewsCount: 98,
    specs: {
      "Form Factor": "65% Compact",
      "Switch Technology": "Magnetic Hall-Effect V2",
      "Actuation Precision": "0.1mm - 4.0mm adjustable",
      "Plate Material": "FR4 / Polycarbonate",
      "Case Material": "CNC Anodized 6063 Aluminum",
    },
    isNewArrival: true,
    discountPercentage: 18,
    reviews: [
      { id: "r201", author: "David T.", rating: 5, title: "Rapid Trigger is a cheat code in Valorant", comment: "Counter-strafing feels effortless now. Deep thocky sound out of the box with zero metallic ping.", date: "2026-08-01", verified: true },
    ],
  },
  {
    id: "gid://shopify/Product/1003",
    handle: "revive-quantum-360-qd-oled-monitor",
    title: "Revive Quantum 360Hz QD-OLED 32\" 4K Gaming Monitor",
    description: "32-inch 4K UHD 360Hz QD-OLED display with 0.03ms GTG response time, VESA DisplayHDR True Black 400, HDMI 2.1, DisplayPort 1.4, and custom vapor chamber cooling.",
    descriptionHtml: "<p>Experience pristine visuals with the <strong>Revive Quantum 360Hz QD-OLED</strong>. Combining 4K UHD resolution with groundbreaking 360Hz refresh rate and near-instantaneous 0.03ms response time, motion clarity is unprecedented.</p><ul><li>32-inch Quantum Dot OLED Panel with 4K 3840x2160 Resolution</li><li>360Hz Refresh Rate & 0.03ms GTG Response Time</li><li>99.3% DCI-P3 Color Gamut & Delta E < 1 Color Accuracy</li><li>Custom Vapor Chamber Cooling system (No Fan Noise)</li><li>3-Year OLED Burn-in Warranty Included</li></ul>",
    vendor: "AsusROG",
    productType: "Monitors",
    tags: ["Monitors", "QD-OLED", "360Hz", "4K UHD", "DisplayHDR", "Flash Deal", "Editor's Pick"],
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "1199.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "1299.99", currencyCode: "USD" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "1399.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "1499.99", currencyCode: "USD" },
    },
    featuredImage: {
      id: "img1003",
      url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
      altText: "Revive Quantum QD-OLED Monitor",
    },
    images: [
      { id: "img1003", url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80", altText: "Front Display" },
      { id: "img1003b", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80", altText: "RGB Backlight Stand" },
    ],
    options: [
      { id: "optM1", name: "Screen Coating", values: ["Glossy Black", "Anti-Reflective Matte"] },
    ],
    variants: [
      {
        id: "gid://shopify/ProductVariant/1003-1",
        title: "Glossy Black Screen Coating",
        sku: "TRT-MON-Q360-GLS",
        availableForSale: true,
        price: { amount: "1199.99", currencyCode: "USD" },
        compareAtPrice: { amount: "1399.99", currencyCode: "USD" },
        selectedOptions: [{ name: "Screen Coating", value: "Glossy Black" }],
      },
    ],
    rating: 4.9,
    reviewsCount: 76,
    specs: {
      "Panel Tech": "3rd Gen QD-OLED",
      "Resolution": "3840 x 2160 (4K UHD)",
      "Refresh Rate": "360Hz Native",
      "Response Time": "0.03ms (GTG)",
      "HDR Rating": "DisplayHDR True Black 400 (1000 nits Peak)",
    },
    isFlashDeal: true,
    discountPercentage: 14,
    reviews: [
      { id: "r301", author: "Siddharth P.", rating: 5, title: "The ultimate display for gaming and media", comment: "Black levels are infinite and the 360Hz on 4K is breathtaking. Vapor chamber keeps it completely silent.", date: "2026-07-20", verified: true },
    ],
  },
  {
    id: "gid://shopify/Product/1004",
    handle: "revive-strikeforce-rtx-5090-laptop",
    title: "Revive Strikeforce 18 RTX 5090 Liquid-Cooled Gaming Laptop",
    description: "Flagship 18-inch Mini-LED 240Hz gaming laptop equipped with Intel Core i9 14th Gen, NVIDIA GeForce RTX 5090 24GB, 64GB DDR5 RAM, and detachable external liquid cooling loop.",
    descriptionHtml: "<p>Unleash desktop-grade performance everywhere with the <strong>Revive Strikeforce 18</strong>. Featuring NVIDIA's latest flagship RTX 5090 graphics card with 24GB GDDR7 memory and an optional magnetic external liquid cooling dock.</p><ul><li>Intel Core i9-14900HX (24 Cores, 32 Threads, up to 5.8GHz)</li><li>NVIDIA GeForce RTX 5090 24GB VRAM (175W TGP Max)</li><li>18-inch QHD+ 240Hz 3ms Mini-LED Display (1200 nits)</li><li>64GB Dual-Channel DDR5 5600MHz RAM & 4TB PCIe Gen5 SSD</li><li>Includes Revive CryoDock Liquid Cooling Accessory</li></ul>",
    vendor: "RazerTech",
    productType: "Laptops",
    tags: ["Laptops", "RTX 5090", "Intel i9", "Mini-LED", "Liquid Cooled", "Best Seller"],
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "3899.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "4299.99", currencyCode: "USD" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "4199.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "4599.99", currencyCode: "USD" },
    },
    featuredImage: {
      id: "img1004",
      url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80",
      altText: "Revive Strikeforce 18 Gaming Laptop",
    },
    images: [
      { id: "img1004", url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80", altText: "Laptop Open Angle" },
      { id: "img1004b", url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80", altText: "Keyboard Lighting" },
    ],
    options: [
      { id: "optL1", name: "RAM & Storage", values: ["64GB DDR5 / 4TB NVMe SSD", "32GB DDR5 / 2TB NVMe SSD"] },
    ],
    variants: [
      {
        id: "gid://shopify/ProductVariant/1004-1",
        title: "64GB DDR5 / 4TB NVMe SSD",
        sku: "TRT-LPT-STR18-5090-64G",
        availableForSale: true,
        price: { amount: "3899.99", currencyCode: "USD" },
        compareAtPrice: { amount: "4199.99", currencyCode: "USD" },
        selectedOptions: [{ name: "RAM & Storage", value: "64GB DDR5 / 4TB NVMe SSD" }],
      },
    ],
    rating: 4.8,
    reviewsCount: 34,
    specs: {
      "GPU": "NVIDIA GeForce RTX 5090 24GB GDDR7",
      "CPU": "Intel Core i9-14900HX 24-Core",
      "Display": "18\" QHD+ 240Hz Mini-LED (1000+ Dimming Zones)",
      "RAM": "64GB DDR5 5600MHz",
      "Storage": "4TB NVMe PCIe 5.0 SSD RAID 0",
    },
    isBestSeller: true,
    discountPercentage: 7,
    reviews: [
      { id: "r401", author: "Alex V.", rating: 5, title: "Desktop replacement redefined", comment: "Runs Cyberpunk 2 with path tracing at 140+ FPS. Liquid cooling dock keeps GPU temperatures below 62C under full stress test.", date: "2026-07-15", verified: true },
    ],
  },
  {
    id: "gid://shopify/Product/1005",
    handle: "revive-planar-planar-planar-headset",
    title: "Revive Acoustic Planar Magnetic Wireless Gaming Headset",
    description: "Audiophile-grade 90mm Planar Magnetic drivers, ultra-low latency 2.4GHz wireless + Bluetooth 5.3 multi-point, broadcast boom mic, and 80-hour battery life.",
    descriptionHtml: "<p>Immerse yourself in pinpoint 3D positional audio with the <strong>Revive Acoustic Planar Headset</strong>. Utilizing oversized 90mm neodymium planar magnetic drivers engineered in Switzerland, audio reproduction is distortion-free across the entire spectrum.</p><ul><li>90mm Neodymium Planar Magnetic Drivers (10Hz - 50,000Hz response)</li><li>Spatial 3D Audio support with DTS Headphone:X 2.0</li><li>Dual Wireless: Simultaneous 2.4GHz High-Res + Bluetooth 5.3</li><li>Detachable 9.7mm Broadcast-Grade Condenser Microphone</li><li>80 Hours Battery Life with Fast Charge (15 mins = 8 hrs)</li></ul>",
    vendor: "SteelSeriesTech",
    productType: "Gaming Headsets",
    tags: ["Headsets", "Planar Magnetic", "Audiophile", "Wireless", "Multi-point", "New Drop"],
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "329.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "349.99", currencyCode: "USD" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "379.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "399.99", currencyCode: "USD" },
    },
    featuredImage: {
      id: "img1005",
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      altText: "Revive Planar Wireless Headset",
    },
    images: [
      { id: "img1005", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80", altText: "Headset Angle" },
      { id: "img1005b", url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80", altText: "Ear Cushion Cushioning" },
    ],
    options: [
      { id: "optH1", name: "Ear Cushion", values: ["Cooling Gel Memory Foam", "Perforated Protein Leather"] },
    ],
    variants: [
      {
        id: "gid://shopify/ProductVariant/1005-1",
        title: "Cooling Gel Memory Foam",
        sku: "TRT-HST-PLN-GEL",
        availableForSale: true,
        price: { amount: "329.99", currencyCode: "USD" },
        compareAtPrice: { amount: "379.99", currencyCode: "USD" },
        selectedOptions: [{ name: "Ear Cushion", value: "Cooling Gel Memory Foam" }],
      },
    ],
    rating: 4.9,
    reviewsCount: 88,
    specs: {
      "Transducer": "90mm Planar Magnetic",
      "Frequency Response": "10Hz - 50kHz",
      "Mic Pattern": "Bi-directional Noise-Canceling",
      "Battery Life": "80 Hours",
      "Weight": "320 Grams",
    },
    isNewArrival: true,
    discountPercentage: 13,
    reviews: [
      { id: "r501", author: "Jordan M.", rating: 5, title: "Soundstage is ridiculously wide", comment: "I can hear footsteps two floors away in Warzone. The planar drivers are crisp and punchy.", date: "2026-08-03", verified: true },
    ],
  },
  {
    id: "gid://shopify/Product/1006",
    handle: "revive-ryzen-9950x-cpu",
    title: "AMD Ryzen 9 9950X 16-Core 32-Thread Processor",
    description: "Zen 5 architecture high-performance CPU with 5.7GHz max boost clock, 80MB L2+L3 cache, PCIe 5.0 support, and integrated Radeon graphics.",
    descriptionHtml: "<p>Power extreme gaming and heavy rendering workloads with the <strong>AMD Ryzen 9 9950X</strong> built on TSMC 4nm Zen 5 architecture.</p>",
    vendor: "AMD",
    productType: "PC Components",
    tags: ["PC Components", "CPU", "AMD", "Zen 5", "16 Cores"],
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "649.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "649.99", currencyCode: "USD" },
    },
    compareAtPriceRange: null,
    featuredImage: {
      id: "img1006",
      url: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80",
      altText: "AMD Ryzen CPU Processor",
    },
    images: [{ id: "img1006", url: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80", altText: "CPU Chip" }],
    options: [{ id: "optCPU", name: "Packaging", values: ["Boxed Processor"] }],
    variants: [{ id: "gid://shopify/ProductVariant/1006-1", title: "Boxed Processor", sku: "AMD-RYZ-9950X", availableForSale: true, price: { amount: "649.99", currencyCode: "USD" }, compareAtPrice: null, selectedOptions: [{ name: "Packaging", value: "Boxed Processor" }] }],
    rating: 4.9,
    reviewsCount: 112,
    specs: { "Cores / Threads": "16 / 32", "Max Boost Clock": "5.7 GHz", "Total Cache": "80 MB", "TDP": "170W", "Socket": "AM5" },
    isBestSeller: true,
  },
  {
    id: "gid://shopify/Product/1007",
    handle: "revive-titan-pro-gaming-chair",
    title: "Revive Titan Pro Ergonomic Gaming Chair",
    description: "Magnetic memory foam head pillow, 4D armrests, cold-cured foam seat, 165-degree recline, and breathable SoftFlex fabric upholstery.",
    descriptionHtml: "<p>Engineered for all-day endurance sessions, the <strong>Revive Titan Pro</strong> provides active lumbar support and high-density cold-cured cushioning.</p>",
    vendor: "SecretlabStyle",
    productType: "Gaming Chairs",
    tags: ["Gaming Chairs", "Ergonomic", "Memory Foam", "4D Armrests"],
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "529.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "569.99", currencyCode: "USD" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "599.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "639.99", currencyCode: "USD" },
    },
    featuredImage: {
      id: "img1007",
      url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80",
      altText: "Revive Titan Pro Gaming Chair",
    },
    images: [{ id: "img1007", url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80", altText: "Chair Front" }],
    options: [{ id: "optCHR", name: "Material", values: ["SoftFlex Breathable Fabric", "Nappa Leatherette"] }],
    variants: [{ id: "gid://shopify/ProductVariant/1007-1", title: "SoftFlex Breathable Fabric", sku: "TRT-CHR-TTN-FAB", availableForSale: true, price: { amount: "529.99", currencyCode: "USD" }, compareAtPrice: { amount: "599.99", currencyCode: "USD" }, selectedOptions: [{ name: "Material", value: "SoftFlex Breathable Fabric" }] }],
    rating: 4.7,
    reviewsCount: 61,
    specs: { "Max Load": "180 kg (395 lbs)", "Recline": "85 to 165 Degrees", "Gas Lift": "Class 4 Hydraulics", "Frame": "Steel Reinforced" },
    discountPercentage: 11,
  },
  {
    id: "gid://shopify/Product/1008",
    handle: "revive-stream-arm-pro-mic-mount",
    title: "Revive StreamArm Pro Low-Profile Microphone Boom Arm",
    description: "Heavy-duty aluminum construction with concealed cable channels, 360-degree rotation, and magnetic desk clamp.",
    descriptionHtml: "<p>Keep your stream clean with the <strong>Revive StreamArm Pro</strong> low-profile mic boom arm featuring hidden magnetic cable routing.</p>",
    vendor: "ElgatoStyle",
    productType: "Accessories",
    tags: ["Accessories", "Boom Arm", "Microphone", "Streaming", "Desk Setup"],
    availableForSale: false,
    priceRange: {
      minVariantPrice: { amount: "89.99", currencyCode: "USD" },
      maxVariantPrice: { amount: "89.99", currencyCode: "USD" },
    },
    compareAtPriceRange: null,
    featuredImage: {
      id: "img1008",
      url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80",
      altText: "Revive StreamArm Pro Boom Arm",
    },
    images: [{ id: "img1008", url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80", altText: "Boom Arm Setup" }],
    options: [{ id: "optACC", name: "Finish", values: ["Matte Black", "Silver Satin"] }],
    variants: [{ id: "gid://shopify/ProductVariant/1008-1", title: "Matte Black", sku: "TRT-ACC-ARM-BLK", availableForSale: false, price: { amount: "89.99", currencyCode: "USD" }, compareAtPrice: null, selectedOptions: [{ name: "Finish", value: "Matte Black" }] }],
    rating: 4.8,
    reviewsCount: 45,
    specs: { "Reach": "740mm Horizontal", "Max Weight": "2.5kg (5.5 lbs)", "Desk Clamp Gap": "Up to 60mm" },
    discountPercentage: 18,
  },
];

export const MOCK_TECH_COLLECTIONS: Collection[] = [
  {
    id: "gid://shopify/Collection/2001",
    handle: "gaming-mice",
    title: "Gaming Mice",
    description: "Esports grade ultra-lightweight wireless and wired gaming mice equipped with high-DPI optical sensors and 8000Hz polling rates.",
    image: { id: "col1", url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80", altText: "Gaming Mice Collection" },
    productsCount: 14,
    products: [MOCK_TECH_PRODUCTS[0]],
  },
  {
    id: "gid://shopify/Collection/2002",
    handle: "gaming-keyboards",
    title: "Gaming Keyboards",
    description: "Rapid Trigger magnetic switch Hall-effect mechanical keyboards designed for maximum competitive advantage.",
    image: { id: "col2", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80", altText: "Gaming Keyboards Collection" },
    productsCount: 18,
    products: [MOCK_TECH_PRODUCTS[1]],
  },
  {
    id: "gid://shopify/Collection/2003",
    handle: "monitors",
    title: "Monitors",
    description: "High refresh rate QD-OLED, Mini-LED, and 4K esports gaming monitors with instantaneous response times.",
    image: { id: "col3", url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80", altText: "Monitors Collection" },
    productsCount: 12,
    products: [MOCK_TECH_PRODUCTS[2]],
  },
  {
    id: "gid://shopify/Collection/2004",
    handle: "laptops",
    title: "Laptops",
    description: "Next-gen liquid-cooled RTX 50-series high-performance gaming and creator laptops.",
    image: { id: "col4", url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80", altText: "Laptops Collection" },
    productsCount: 9,
    products: [MOCK_TECH_PRODUCTS[3]],
  },
  {
    id: "gid://shopify/Collection/2005",
    handle: "gaming-headsets",
    title: "Gaming Headsets",
    description: "Audiophile-grade Planar Magnetic wireless headsets with 3D spatial surround audio positioning.",
    image: { id: "col5", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80", altText: "Headsets Collection" },
    productsCount: 15,
    products: [MOCK_TECH_PRODUCTS[4]],
  },
  {
    id: "gid://shopify/Collection/2006",
    handle: "pc-components",
    title: "PC Components",
    description: "Flagship CPUs, GPUs, PCIe 5.0 NVMe SSDs, liquid coolers, and custom power supplies.",
    image: { id: "col6", url: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80", altText: "PC Components Collection" },
    productsCount: 22,
    products: [MOCK_TECH_PRODUCTS[5]],
  },
  {
    id: "gid://shopify/Collection/2007",
    handle: "gaming-chairs",
    title: "Gaming Chairs",
    description: "Ergonomic cold-cured memory foam gaming chairs engineered for posture support during long gaming sessions.",
    image: { id: "col7", url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80", altText: "Gaming Chairs Collection" },
    productsCount: 8,
    products: [MOCK_TECH_PRODUCTS[6]],
  },
  {
    id: "gid://shopify/Collection/2008",
    handle: "accessories",
    title: "Accessories",
    description: "Low-profile mic boom arms, desk pads, stream controllers, cable management, and audio interfaces.",
    image: { id: "col8", url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80", altText: "Accessories Collection" },
    productsCount: 26,
    products: [MOCK_TECH_PRODUCTS[7]],
  },
];

export const MOCK_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "gid://shopify/Article/3001",
    handle: "how-to-choose-the-perfect-oled-monitor-in-2026",
    title: "How to Choose the Ultimate QD-OLED Monitor in 2026",
    excerpt: "Breakdown of 360Hz refresh rates, subpixel layouts, burn-in protection, and heat dissipation technology for next-gen gaming displays.",
    content: "Selecting a modern high-end gaming display is no longer just about resolution. In 2026, QD-OLED (Quantum Dot OLED) technology has revolutionized gaming monitors with pixel-level dimming, infinite contrast ratios, and 0.03ms response times. In this guide, we break down what matters most: refresh rate scaling up to 360Hz, panel coating comparisons (Glossy vs Matte), and active heat management through vapor chambers...",
    contentHtml: "<p>Selecting a modern high-end gaming display is no longer just about resolution. In 2026, QD-OLED (Quantum Dot OLED) technology has revolutionized gaming monitors with pixel-level dimming, infinite contrast ratios, and 0.03ms response times.</p><h3>1. Why 360Hz QD-OLED is the new Esports Benchmark</h3><p>Unlike traditional IPS panels that require motion blur reduction (strobing) to clear ghosting, QD-OLED pixels transition in a fraction of a millisecond. At 360Hz, motion clarity matches CRT displays while delivering vibrant 99.3% DCI-P3 color depth.</p><h3>2. Burn-In Mitigation Technology</h3><p>Modern QD-OLED monitors now feature custom copper vapor chambers and graphite film layers that draw heat away from organic LED layers, significantly extending panel lifespan.</p>",
    publishedAt: "2026-08-05T10:00:00Z",
    author: "Alex Mercer, Lead Hardware Editor",
    readingTimeMinutes: 5,
    tags: ["Monitors", "QD-OLED", "Hardware Guide", "Displays"],
    image: {
      id: "artImg1",
      url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
      altText: "OLED Gaming Monitor Setup",
    },
  },
  {
    id: "gid://shopify/Article/3002",
    handle: "rapid-trigger-magnetic-switches-explained",
    title: "Rapid Trigger & Hall-Effect Switches: The Death of Mechanical Keyboards?",
    excerpt: "Why competitive FPS players are switching to magnetic switches with 0.1mm adjustable actuation for instant counter-strafing.",
    content: "Magnetic Hall-Effect switches operate using magnetic flux measurements rather than physical copper contacts. Learn how Rapid Trigger technology detects key releases the instant your finger lifts up...",
    contentHtml: "<p>Magnetic Hall-Effect switches operate using magnetic flux measurements rather than physical copper contacts. This removes mechanical debounce delays and allows dynamic actuation points adjustable from 0.1mm to 4.0mm.</p><h3>Dynamic Reset Points</h3><p>In games like Valorant or Counter-Strike 2, stopping instantly determines accuracy. With Rapid Trigger, the key resets the millisecond you move upward, allowing instant counter-strafing.</p>",
    publishedAt: "2026-07-29T14:30:00Z",
    author: "Elena Rostova",
    readingTimeMinutes: 4,
    tags: ["Keyboards", "Rapid Trigger", "Tech Analysis"],
    image: {
      id: "artImg2",
      url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
      altText: "Magnetic Keyboard PCB",
    },
  },
];

// Helper: Fetch Shopify Storefront API GraphQL or return fallback tech dataset
export async function fetchShopifyGraphQL(query: string, variables: Record<string, any> = {}) {
  try {
    const response = await fetch("/api/shopify/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.warn("GraphQL Proxy unreachable, fallback to local store engine:", error);
    return null;
  }
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

// Storefront API Functions for Products, Collections, Blogs, Search, and Cart
export async function getProductsFromShopify(options?: { first?: number; after?: string | null }): Promise<{ products: Product[]; pageInfo: PageInfo }> {
  const first = options?.first || 30;
  const after = options?.after || null;

  const result: any = await fetchShopifyGraphQL(STOREFRONT_QUERIES.GET_PRODUCTS, {
    first,
    after,
  });

  if (result && result.data && result.data.products && result.data.products.edges) {
    const pageInfo: PageInfo = {
      hasNextPage: Boolean(result.data.products.pageInfo?.hasNextPage),
      endCursor: result.data.products.pageInfo?.endCursor || null,
    };

    const edges = result.data.products.edges;

    const pageProducts: Product[] = edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        handle: node.handle,
        title: node.title,
        description: node.description || "",
        descriptionHtml: node.descriptionHtml || node.description || "",
        vendor: node.vendor || "TheReviveTech",
        productType: node.productType || "Hardware",
        tags: node.tags || [],
        availableForSale: node.availableForSale,
        priceRange: {
          minVariantPrice: node.priceRange?.minVariantPrice || { amount: "0.00", currencyCode: "USD" },
          maxVariantPrice: node.priceRange?.maxVariantPrice || { amount: "0.00", currencyCode: "USD" },
        },
        compareAtPriceRange: node.compareAtPriceRange,
        featuredImage: node.featuredImage || (node.images?.edges[0]?.node ? node.images.edges[0].node : null),
        images: node.images?.edges?.map((e: any) => e.node) || [],
        options: node.options || [],
        variants: node.variants?.edges?.map((e: any) => ({
          id: e.node.id,
          title: e.node.title,
          sku: e.node.sku,
          availableForSale: e.node.availableForSale,
          price: e.node.price,
          compareAtPrice: e.node.compareAtPrice,
          selectedOptions: e.node.selectedOptions,
        })) || [],
        rating: 4.8,
        reviewsCount: 12,
      };
    });

    return { products: pageProducts, pageInfo };
  }

  return { products: [], pageInfo: { hasNextPage: false, endCursor: null } };
}

export async function getProductByHandleFromShopify(handle: string): Promise<Product | null> {
  const result = await fetchShopifyGraphQL(STOREFRONT_QUERIES.GET_PRODUCT_BY_HANDLE, { handle });
  if (result && result.data && result.data.product) {
    const node = result.data.product;
    return {
      id: node.id,
      handle: node.handle,
      title: node.title,
      description: node.description || "",
      descriptionHtml: node.descriptionHtml || node.description || "",
      vendor: node.vendor || "TheReviveTech",
      productType: node.productType || "Hardware",
      tags: node.tags || [],
      availableForSale: node.availableForSale,
      priceRange: {
        minVariantPrice: node.priceRange?.minVariantPrice || { amount: "0.00", currencyCode: "USD" },
        maxVariantPrice: node.priceRange?.maxVariantPrice || { amount: "0.00", currencyCode: "USD" },
      },
      compareAtPriceRange: node.compareAtPriceRange,
      featuredImage: node.featuredImage || (node.images?.edges[0]?.node ? node.images.edges[0].node : null),
      images: node.images?.edges?.map((e: any) => e.node) || [],
      options: node.options || [],
      variants: node.variants?.edges?.map((e: any) => ({
        id: e.node.id,
        title: e.node.title,
        sku: e.node.sku,
        availableForSale: e.node.availableForSale,
        price: e.node.price,
        compareAtPrice: e.node.compareAtPrice,
        selectedOptions: e.node.selectedOptions,
      })) || [],
      rating: 4.9,
      reviewsCount: 15,
      reviews: [],
      specs: {},
    };
  }
  return null;
}

export async function getCollectionsFromShopify(options?: { first?: number; after?: string | null }): Promise<{ collections: Collection[]; pageInfo: PageInfo }> {
  const first = options?.first || 12;
  const after = options?.after || null;

  const result = await fetchShopifyGraphQL(STOREFRONT_QUERIES.GET_COLLECTIONS, { first, after });
  if (result && result.data && result.data.collections && result.data.collections.edges) {
    const pageInfo: PageInfo = {
      hasNextPage: Boolean(result.data.collections.pageInfo?.hasNextPage),
      endCursor: result.data.collections.pageInfo?.endCursor || null,
    };

    const liveCollections: Collection[] = result.data.collections.edges.map((edge: any) => {
      const node = edge.node;
      const prods: Product[] = node.products?.edges?.map((pEdge: any) => {
        const pNode = pEdge.node;
        return {
          id: pNode.id,
          handle: pNode.handle,
          title: pNode.title,
          description: pNode.description || "",
          descriptionHtml: pNode.descriptionHtml || pNode.description || "",
          vendor: pNode.vendor || "TheReviveTech",
          productType: pNode.productType || "Hardware",
          tags: pNode.tags || [],
          availableForSale: pNode.availableForSale,
          priceRange: {
            minVariantPrice: pNode.priceRange?.minVariantPrice || { amount: "0.00", currencyCode: "USD" },
            maxVariantPrice: pNode.priceRange?.maxVariantPrice || { amount: "0.00", currencyCode: "USD" },
          },
          compareAtPriceRange: pNode.compareAtPriceRange,
          featuredImage: pNode.featuredImage || (pNode.images?.edges[0]?.node ? pNode.images.edges[0].node : null),
          images: pNode.images?.edges?.map((e: any) => e.node) || [],
          options: pNode.options || [],
          variants: pNode.variants?.edges?.map((e: any) => ({
            id: e.node.id,
            title: e.node.title,
            sku: e.node.sku,
            availableForSale: e.node.availableForSale,
            price: e.node.price,
            compareAtPrice: e.node.compareAtPrice,
            selectedOptions: e.node.selectedOptions,
          })) || [],
          rating: 4.8,
          reviewsCount: 12,
        };
      }) || [];

      return {
        id: node.id,
        handle: node.handle,
        title: node.title,
        description: node.description || "",
        image: node.image,
        productsCount: prods.length,
        products: prods,
      };
    });

    return { collections: liveCollections, pageInfo };
  }

  return { collections: [], pageInfo: { hasNextPage: false, endCursor: null } };
}

export async function getCollectionByHandleFromShopify(handle: string, options?: { first?: number; after?: string | null }): Promise<{ collection: Collection | null; pageInfo: PageInfo }> {
  const first = options?.first || 30;
  const after = options?.after || null;

  const result = await fetchShopifyGraphQL(STOREFRONT_QUERIES.GET_COLLECTION_BY_HANDLE, { handle, first, after });
  if (result && result.data && result.data.collection) {
    const node = result.data.collection;
    const pageInfo: PageInfo = {
      hasNextPage: Boolean(node.products?.pageInfo?.hasNextPage),
      endCursor: node.products?.pageInfo?.endCursor || null,
    };

    const prods: Product[] = node.products?.edges?.map((pEdge: any) => {
      const pNode = pEdge.node;
      return {
        id: pNode.id,
        handle: pNode.handle,
        title: pNode.title,
        description: pNode.description || "",
        descriptionHtml: pNode.descriptionHtml || pNode.description || "",
        vendor: pNode.vendor || "TheReviveTech",
        productType: pNode.productType || "Hardware",
        tags: pNode.tags || [],
        availableForSale: pNode.availableForSale,
        priceRange: {
          minVariantPrice: pNode.priceRange?.minVariantPrice || { amount: "0.00", currencyCode: "USD" },
          maxVariantPrice: pNode.priceRange?.maxVariantPrice || { amount: "0.00", currencyCode: "USD" },
        },
        compareAtPriceRange: pNode.compareAtPriceRange,
        featuredImage: pNode.featuredImage || (pNode.images?.edges[0]?.node ? pNode.images.edges[0].node : null),
        images: pNode.images?.edges?.map((e: any) => e.node) || [],
        options: pNode.options || [],
        variants: pNode.variants?.edges?.map((e: any) => ({
          id: e.node.id,
          title: e.node.title,
          sku: e.node.sku,
          availableForSale: e.node.availableForSale,
          price: e.node.price,
          compareAtPrice: e.node.compareAtPrice,
          selectedOptions: e.node.selectedOptions,
        })) || [],
        rating: 4.8,
        reviewsCount: 12,
      };
    }) || [];

    const collectionObj: Collection = {
      id: node.id,
      handle: node.handle,
      title: node.title,
      description: node.description || "",
      image: node.image,
      productsCount: prods.length,
      products: prods,
    };

    return { collection: collectionObj, pageInfo };
  }

  return { collection: null, pageInfo: { hasNextPage: false, endCursor: null } };
}

export async function getBlogArticlesFromShopify(options?: { first?: number; after?: string | null }): Promise<{ articles: BlogArticle[]; pageInfo: PageInfo }> {
  const first = options?.first || 12;
  const after = options?.after || null;

  const result = await fetchShopifyGraphQL(STOREFRONT_QUERIES.GET_ARTICLES, { first, after });
  if (result && result.data && result.data.articles && result.data.articles.edges) {
    const pageInfo: PageInfo = {
      hasNextPage: Boolean(result.data.articles.pageInfo?.hasNextPage),
      endCursor: result.data.articles.pageInfo?.endCursor || null,
    };

    const liveArticles: BlogArticle[] = result.data.articles.edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        handle: node.handle,
        title: node.title,
        content: node.content || "",
        contentHtml: node.contentHtml || node.content || "",
        excerpt: node.excerpt || "",
        publishedAt: node.publishedAt,
        author: node.authorV2?.name || "TheReviveTech Editorial",
        image: node.image,
        tags: node.tags || [],
        readingTimeMinutes: Math.max(2, Math.ceil((node.excerpt || node.title || "").split(" ").length / 50)),
      };
    });

    return { articles: liveArticles, pageInfo };
  }

  return { articles: [], pageInfo: { hasNextPage: false, endCursor: null } };
}

export async function getBlogArticleByHandleFromShopify(handle: string): Promise<BlogArticle | null> {
  const result = await fetchShopifyGraphQL(STOREFRONT_QUERIES.GET_ARTICLE_BY_HANDLE, { handle });
  if (result && result.data && result.data.articles && result.data.articles.edges) {
    const edge = result.data.articles.edges.find((e: any) => e.node.handle === handle) || result.data.articles.edges[0];
    if (edge) {
      const node = edge.node;
      const wordCount = (node.content || node.excerpt || "").split(/\s+/).length;
      return {
        id: node.id,
        handle: node.handle,
        title: node.title,
        content: node.content || "",
        contentHtml: node.contentHtml || node.content || "<p>Detailed editorial benchmark analysis coming soon.</p>",
        excerpt: node.excerpt || "",
        publishedAt: node.publishedAt,
        author: node.authorV2?.name || "TheReviveTech Editorial",
        image: node.image,
        tags: node.tags || ["Tech", "Hardware"],
        readingTimeMinutes: Math.max(3, Math.ceil(wordCount / 200)),
      };
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// SHOPIFY STOREFRONT CART API (Standard Modern Headless Checkout Architecture)
// -----------------------------------------------------------------------------

/**
 * Ensures variant ID is formatted as a valid Shopify GraphQL GID:
 * gid://shopify/ProductVariant/<id>
 */
export function ensureVariantGid(id: string | number): string {
  const str = String(id || "").trim();
  if (str.startsWith("gid://shopify/ProductVariant/")) {
    return str;
  }
  const digits = str.replace(/\D/g, "");
  if (digits) {
    return `gid://shopify/ProductVariant/${digits}`;
  }
  return str;
}

/**
 * Transforms Shopify Storefront GraphQL cart response into the application Cart interface.
 */
export function transformShopifyCart(cartData: any): Cart | null {
  if (!cartData || !cartData.id) return null;

  const lines: CartLineItem[] =
    cartData.lines?.edges?.map((edge: any) => {
      const node = edge.node;
      const merch = node.merchandise || {};
      const prod = merch.product || {};
      return {
        id: node.id,
        quantity: node.quantity || 1,
        merchandise: {
          id: merch.id || "",
          title: merch.title || "Standard",
          price: merch.price || { amount: "0.00", currencyCode: "PKR" },
          image: merch.image || prod.featuredImage || null,
          selectedOptions: merch.selectedOptions || [],
          product: {
            id: prod.id || "",
            handle: prod.handle || "",
            title: prod.title || "Product",
            featuredImage: prod.featuredImage || null,
            vendor: prod.vendor || "TheReviveTech",
          },
        },
      };
    }) || [];

  return {
    id: cartData.id,
    checkoutUrl: cartData.checkoutUrl || "",
    totalQuantity: cartData.totalQuantity || lines.reduce((sum, l) => sum + l.quantity, 0),
    cost: {
      subtotalAmount: cartData.cost?.subtotalAmount || { amount: "0.00", currencyCode: "PKR" },
      totalAmount: cartData.cost?.totalAmount || { amount: "0.00", currencyCode: "PKR" },
      totalTaxAmount: cartData.cost?.totalTaxAmount,
    },
    lines,
  };
}

/**
 * Creates a new Shopify Cart with optional initial line items.
 */
export async function createShopifyCart(
  lines?: Array<{ merchandiseId: string; quantity: number }>
): Promise<Cart | null> {
  try {
    const formattedLines = (lines || []).map((l) => ({
      merchandiseId: ensureVariantGid(l.merchandiseId),
      quantity: Math.max(1, l.quantity || 1),
    }));

    const result = await fetchShopifyGraphQL(STOREFRONT_QUERIES.CART_CREATE, {
      input: {
        lines: formattedLines,
      },
    });

    if (result?.data?.cartCreate?.cart) {
      return transformShopifyCart(result.data.cartCreate.cart);
    }
    if (result?.data?.cartCreate?.userErrors?.length) {
      console.warn("Shopify cartCreate userErrors:", result.data.cartCreate.userErrors);
    }
  } catch (error) {
    console.error("Failed to create Shopify cart:", error);
  }
  return null;
}

/**
 * Retrieves an active cart from Shopify Storefront API by ID.
 */
export async function getShopifyCart(cartId: string): Promise<Cart | null> {
  if (!cartId) return null;
  try {
    const result = await fetchShopifyGraphQL(STOREFRONT_QUERIES.GET_CART, { cartId });
    if (result?.data?.cart) {
      return transformShopifyCart(result.data.cart);
    }
  } catch (error) {
    console.error("Failed to fetch Shopify cart:", error);
  }
  return null;
}

/**
 * Adds line items to an existing Shopify Cart.
 */
export async function addLinesToShopifyCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<Cart | null> {
  if (!cartId) return null;
  try {
    const formattedLines = lines.map((l) => ({
      merchandiseId: ensureVariantGid(l.merchandiseId),
      quantity: Math.max(1, l.quantity || 1),
    }));

    const result = await fetchShopifyGraphQL(STOREFRONT_QUERIES.CART_LINES_ADD, {
      cartId,
      lines: formattedLines,
    });

    if (result?.data?.cartLinesAdd?.cart) {
      return transformShopifyCart(result.data.cartLinesAdd.cart);
    }
    if (result?.data?.cartLinesAdd?.userErrors?.length) {
      console.warn("Shopify cartLinesAdd userErrors:", result.data.cartLinesAdd.userErrors);
    }
  } catch (error) {
    console.error("Failed adding lines to Shopify cart:", error);
  }
  return null;
}

/**
 * Updates line item quantities in an existing Shopify Cart.
 */
export async function updateLinesInShopifyCart(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<Cart | null> {
  if (!cartId) return null;
  try {
    const result = await fetchShopifyGraphQL(STOREFRONT_QUERIES.CART_LINES_UPDATE, {
      cartId,
      lines: lines.map((l) => ({ id: l.id, quantity: Math.max(0, l.quantity) })),
    });

    if (result?.data?.cartLinesUpdate?.cart) {
      return transformShopifyCart(result.data.cartLinesUpdate.cart);
    }
  } catch (error) {
    console.error("Failed updating lines in Shopify cart:", error);
  }
  return null;
}

/**
 * Removes line items from an existing Shopify Cart.
 */
export async function removeLinesFromShopifyCart(
  cartId: string,
  lineIds: string[]
): Promise<Cart | null> {
  if (!cartId || !lineIds.length) return null;
  try {
    const result = await fetchShopifyGraphQL(STOREFRONT_QUERIES.CART_LINES_REMOVE, {
      cartId,
      lineIds,
    });

    if (result?.data?.cartLinesRemove?.cart) {
      return transformShopifyCart(result.data.cartLinesRemove.cart);
    }
  } catch (error) {
    console.error("Failed removing lines from Shopify cart:", error);
  }
  return null;
}

/**
 * Primary checkout helper: Gets or creates the real Shopify Cart and returns its official checkoutUrl.
 * No custom order creation, no OAuth, no Admin API dependency.
 * Returns the exact Storefront API Cart checkoutUrl untouched.
 */
export async function getOrCreateShopifyCartCheckoutUrl(
  cartLines: CartLineItem[],
  existingCartId?: string
): Promise<{ checkoutUrl: string; cartId: string } | null> {
  if (!cartLines || cartLines.length === 0) return null;

  // Format line items with real Shopify variant IDs
  const lines = cartLines.map((line) => ({
    merchandiseId: ensureVariantGid(line.merchandise.id),
    quantity: Math.max(1, line.quantity || 1),
  }));

  // If existing cart ID is present, verify if valid and has checkoutUrl
  if (existingCartId) {
    try {
      const existingCart = await getShopifyCart(existingCartId);
      if (existingCart && existingCart.checkoutUrl) {
        return {
          checkoutUrl: existingCart.checkoutUrl,
          cartId: existingCart.id,
        };
      }
    } catch (e) {
      console.warn("Existing cart lookup failed, creating fresh cart:", e);
    }
  }

  // Create fresh Shopify cart with current line items
  const createdCart = await createShopifyCart(lines);
  if (createdCart && createdCart.checkoutUrl) {
    try {
      localStorage.setItem("shopify_cart_id", createdCart.id);
    } catch {}
    return {
      checkoutUrl: createdCart.checkoutUrl,
      cartId: createdCart.id,
    };
  }

  return null;
}
