import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Collection, BlogArticle, CartLineItem, ViewState, Customer } from "../types";
import { 
  getProductsFromShopify, 
  getProductByHandleFromShopify,
  getCollectionsFromShopify, 
  getBlogArticlesFromShopify, 
  STOREFRONT_QUERIES,
  ensureVariantGid,
  getShopifyCart,
  createShopifyCart,
  addLinesToShopifyCart,
  updateLinesInShopifyCart,
  removeLinesFromShopifyCart,
  getOrCreateShopifyCartCheckoutUrl
} from "../lib/shopify";

interface ShopifyContextType {
  // Navigation View State
  viewState: ViewState;
  setViewState: (view: ViewState) => void;
  navigateToHome: () => void;
  navigateToShop: () => void;
  navigateToExploreAll: () => void;
  navigateToSale: () => void;
  navigateToProduct: (handle: string) => void;
  navigateToCollection: (handle: string) => void;
  navigateToCollectionsList: () => void;
  navigateToBlog: () => void;
  navigateToArticle: (handle: string) => void;
  navigateToAccount: () => void;
  navigateToAbout: () => void;
  navigateToContact: () => void;
  navigateToFAQ: () => void;
  navigateToSearch: (query?: string) => void;
  navigateToCart: () => void;
  navigateToCheckout: () => void;
  navigateToOrderConfirmation: (orderReference: string) => void;
  navigateToPage: (handle: string) => void;

  // Shopify Storefront Data
  products: Product[];
  collections: Collection[];
  articles: BlogArticle[];
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  fetchProductByHandle: (handle: string) => Promise<Product | null>;

  // Progressive Pagination & Background Prefetching
  hasMoreProducts: boolean;
  isFetchingMoreProducts: boolean;
  fetchMoreProducts: () => Promise<void>;
  fetchAllProducts: () => Promise<void>;

  hasMoreArticles: boolean;
  isFetchingMoreArticles: boolean;
  fetchMoreArticles: () => Promise<void>;
  fetchAllArticles: () => Promise<void>;

  hasMoreCollections: boolean;
  isFetchingMoreCollections: boolean;
  fetchMoreCollections: () => Promise<void>;
  fetchAllCollections: () => Promise<void>;

  // Live Shopify Store Domain Config
  storeDomain: string;
  isMockShop: boolean;
  updateStoreConfig: (domain: string, token: string) => Promise<boolean>;

  // Cart Management (Shopify Storefront Cart API)
  cartLines: CartLineItem[];
  addToCart: (product: Product, variantId?: string, quantity?: number) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartSubtotal: number;
  cartCount: number;
  discountCode: string;
  applyDiscountCode: (code: string) => void;
  discountPercentage: number;
  freeShippingThreshold: number;
  handleCheckout: () => Promise<void>;
  isCheckingOut: boolean;
  shopifyCartId: string;
  cartCheckoutUrl: string;

  // Wishlist
  wishlistHandles: string[];
  toggleWishlist: (handle: string) => void;
  isInWishlist: (handle: string) => boolean;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // Compare
  compareHandles: string[];
  toggleCompare: (handle: string) => void;
  isInCompare: (handle: string) => boolean;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;

  // Quick View Modal
  quickViewHandle: string | null;
  setQuickViewHandle: (handle: string | null) => void;

  // Global Search Modal (CMD+K)
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Mobile Off-Canvas Nav Drawer
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;

  // Recently Viewed
  recentlyViewedHandles: string[];
  addRecentlyViewed: (handle: string) => void;

  // Customer Account
  customer: Customer | null;
  isLoggedIn: boolean;
  loginCustomer: (email: string, password?: string) => void;
  logoutCustomer: () => void;

  // Shopify Config Bar Modal
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

export function parseUrlToViewState(path: string, search: string): ViewState {
  let cleanPath = decodeURIComponent(path || "").replace(/\/+$/, "");
  if (!cleanPath || cleanPath === "") return { type: "home" };
  if (cleanPath === "/shop") return { type: "shop" };
  if (cleanPath === "/explore-all") return { type: "explore_all" };
  if (cleanPath === "/sale") return { type: "sale" };
  if (cleanPath === "/collections" || cleanPath === "/collection") return { type: "collections_list" };
  if (cleanPath.startsWith("/collections/")) {
    const handle = cleanPath.replace(/^\/collections\//, "").replace(/^\/+|\/+$/g, "");
    if (handle) return { type: "collection", handle };
  }
  if (cleanPath.startsWith("/collection/")) {
    const handle = cleanPath.replace(/^\/collection\//, "").replace(/^\/+|\/+$/g, "");
    if (handle) return { type: "collection", handle };
  }
  if (cleanPath.startsWith("/products/")) {
    const handle = cleanPath.replace(/^\/products\//, "").replace(/^\/+|\/+$/g, "");
    if (handle) return { type: "product", handle };
  }
  if (cleanPath.startsWith("/product/")) {
    const handle = cleanPath.replace(/^\/product\//, "").replace(/^\/+|\/+$/g, "");
    if (handle) return { type: "product", handle };
  }
  if (cleanPath === "/cart") return { type: "cart" };
  if (
    cleanPath === "/checkout" ||
    cleanPath.startsWith("/cart/c/") ||
    cleanPath.startsWith("/checkouts/") ||
    (cleanPath.startsWith("/cart/") && cleanPath.includes("/checkouts"))
  ) {
    return { type: "checkout" };
  }
  if (cleanPath.startsWith("/order-confirmation/")) {
    const orderReference = cleanPath.replace(/^\/order-confirmation\//, "").replace(/^\/+|\/+$/g, "");
    if (orderReference) return { type: "order_confirmation", orderReference };
  }
  if (cleanPath === "/search") {
    const query = new URLSearchParams(search).get("q") || "";
    return { type: "search", query };
  }
  if (cleanPath === "/about") return { type: "about" };
  if (cleanPath === "/contact") return { type: "contact" };
  if (cleanPath === "/blogs" || cleanPath === "/blog") return { type: "blog" };
  if (cleanPath.startsWith("/blogs/")) {
    const parts = cleanPath.replace(/^\/blogs\//, "").split("/").filter(Boolean);
    const handle = parts[parts.length - 1];
    if (handle) return { type: "article", handle };
  }
  if (cleanPath.startsWith("/blog/")) {
    const parts = cleanPath.replace(/^\/blog\//, "").split("/").filter(Boolean);
    const handle = parts[parts.length - 1];
    if (handle) return { type: "article", handle };
  }
  if (cleanPath.startsWith("/article/")) {
    const handle = cleanPath.replace(/^\/article\//, "").replace(/^\/+|\/+$/g, "");
    if (handle) return { type: "article", handle };
  }
  if (cleanPath === "/account") return { type: "account" };
  if (cleanPath === "/faq") return { type: "faq" };
  if (
    cleanPath === "/terms-of-service" ||
    cleanPath === "/privacy-policy" ||
    cleanPath === "/refund-policy" ||
    cleanPath === "/shipping-policy"
  ) {
    return { type: "page", handle: cleanPath.replace(/^\//, "") };
  }
  if (cleanPath.startsWith("/page/")) {
    const handle = cleanPath.replace(/^\/page\//, "").replace(/^\/+|\/+$/g, "");
    if (handle) return { type: "page", handle };
  }
  return { type: "home" };
}

export function viewStateToUrl(view: ViewState): string {
  switch (view.type) {
    case "home":
      return "/";
    case "shop":
      return "/shop";
    case "explore_all":
      return "/explore-all";
    case "sale":
      return "/sale";
    case "collections_list":
      return "/collections";
    case "collection":
      return `/collections/${view.handle}`;
    case "product":
      return `/products/${view.handle}`;
    case "cart":
      return "/cart";
    case "checkout":
      return "/checkout";
    case "order_confirmation":
      return `/order-confirmation/${view.orderReference}`;
    case "search":
      return view.query ? `/search?q=${encodeURIComponent(view.query)}` : "/search";
    case "about":
      return "/about";
    case "contact":
      return "/contact";
    case "blog":
      return "/blog";
    case "article":
      return `/blog/${view.handle}`;
    case "account":
      return "/account";
    case "faq":
      return "/faq";
    case "page":
      return `/page/${view.handle}`;
    default:
      return "/";
  }
}

const ShopifyContext = createContext<ShopifyContextType | undefined>(undefined);

export const ShopifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewState, setViewStateInternal] = useState<ViewState>(() => {
    if (typeof window !== "undefined") {
      return parseUrlToViewState(window.location.pathname, window.location.search);
    }
    return { type: "home" };
  });

  const setViewState = (view: ViewState, pushHistory = true) => {
    setViewStateInternal(view);
    if (pushHistory && typeof window !== "undefined") {
      const targetUrl = viewStateToUrl(view);
      if (window.location.pathname + window.location.search !== targetUrl) {
        window.history.pushState(view, "", targetUrl);
      }
    }
  };

  const [storeDomain, setStoreDomain] = useState<string>("dbbys1-nd.myshopify.com");
  const [isMockShop, setIsMockShop] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    // If the browser loaded a Shopify checkout path directly, forward to Shopify Checkout host
    if (
      path.startsWith("/cart/c/") ||
      path.startsWith("/checkouts/") ||
      (path.startsWith("/cart/") && path.includes("/checkouts"))
    ) {
      const metaEnv = (import.meta as any)?.env || {};
      const targetHost = (
        metaEnv.VITE_SHOPIFY_CHECKOUT_DOMAIN ||
        metaEnv.VITE_SHOPIFY_STORE_DOMAIN ||
        storeDomain ||
        "dbbys1-nd.myshopify.com"
      ).trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
      const targetUrl = `https://${targetHost}${window.location.pathname}${window.location.search}${window.location.hash}`;
      console.log("[Shopify SPA Router] Incoming checkout URL detected, forwarding directly to native Shopify Checkout:", targetUrl);
      window.location.replace(targetUrl);
      return;
    }

    const handlePopState = () => {
      const newView = parseUrlToViewState(window.location.pathname, window.location.search);
      setViewStateInternal(newView);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [storeDomain]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Cart State
  const [cartLines, setCartLines] = useState<CartLineItem[]>(() => {
    try {
      const saved = localStorage.getItem("trt_cart_lines");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [shopifyCartId, setShopifyCartId] = useState<string>(() => {
    try {
      return localStorage.getItem("shopify_cart_id") || "";
    } catch {
      return "";
    }
  });
  const [cartCheckoutUrl, setCartCheckoutUrl] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const freeShippingThreshold = 200;

  // Wishlist State
  const [wishlistHandles, setWishlistHandles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("trt_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Compare State
  const [compareHandles, setCompareHandles] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  // Quick View & Search
  const [quickViewHandle, setQuickViewHandle] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Recently Viewed
  const [recentlyViewedHandles, setRecentlyViewedHandles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("trt_recently_viewed");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Customer Account
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem("trt_customer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Scroll to top on view state change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewState]);

  // Keyboard shortcut CMD+K / CTRL+K for live search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Save cart & wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem("trt_cart_lines", JSON.stringify(cartLines));
    } catch (e) { console.error(e); }
  }, [cartLines]);

  useEffect(() => {
    try {
      localStorage.setItem("trt_wishlist", JSON.stringify(wishlistHandles));
    } catch (e) { console.error(e); }
  }, [wishlistHandles]);

  useEffect(() => {
    try {
      localStorage.setItem("trt_recently_viewed", JSON.stringify(recentlyViewedHandles));
    } catch (e) { console.error(e); }
  }, [recentlyViewedHandles]);

  // Cursor Pagination & Progressive Loading State
  const [productCursor, setProductCursor] = useState<string | null>(null);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(false);
  const [isFetchingMoreProducts, setIsFetchingMoreProducts] = useState<boolean>(false);

  const [articleCursor, setArticleCursor] = useState<string | null>(null);
  const [hasMoreArticles, setHasMoreArticles] = useState<boolean>(false);
  const [isFetchingMoreArticles, setIsFetchingMoreArticles] = useState<boolean>(false);

  const [collectionCursor, setCollectionCursor] = useState<string | null>(null);
  const [hasMoreCollections, setHasMoreCollections] = useState<boolean>(false);
  const [isFetchingMoreCollections, setIsFetchingMoreCollections] = useState<boolean>(false);

  // Load Initial Shopify Data (Optimized fast critical-path rendering)
  const loadShopifyData = async () => {
    setIsLoadingData(true);
    try {
      // 0. Direct Product Critical Path: If opened on a product page, prioritize fetching that exact product
      let directProductPromise: Promise<any> = Promise.resolve(null);
      if (viewState.type === "product" && "handle" in viewState && viewState.handle) {
        const directHandle = viewState.handle;
        directProductPromise = getProductByHandleFromShopify(directHandle)
          .then((directProd) => {
            if (directProd) {
              setProducts((prev) => {
                if (prev.some((p) => p.handle === directProd.handle || p.id === directProd.id)) {
                  return prev.map((p) => (p.handle === directProd.handle || p.id === directProd.id ? directProd : p));
                }
                return [directProd, ...prev];
              });
            }
            return directProd;
          })
          .catch((err) => {
            console.warn("Direct product preload error:", err);
          });
      }

      // 1. Critical Path: Products fetch resolves & paints immediately
      const productsPromise = getProductsFromShopify({ first: 20 })
        .then((pRes) => {
          if (pRes?.products?.length > 0) {
            setProducts((prev) => {
              const existingHandles = new Set(prev.map((p) => p.handle));
              const additions = pRes.products.filter((p) => !existingHandles.has(p.handle));
              return [...prev, ...additions];
            });
            setProductCursor(pRes.pageInfo.endCursor);
            setHasMoreProducts(pRes.pageInfo.hasNextPage);
          }
          // Unblock loading state immediately once products arrive
          setIsLoadingData(false);
          return pRes;
        })
        .catch((err) => {
          console.warn("Product loading error:", err);
          setIsLoadingData(false);
        });

      // 2. Collections fetch runs concurrently
      const collectionsPromise = getCollectionsFromShopify({ first: 8 })
        .then((cRes) => {
          if (cRes?.collections?.length > 0) {
            setCollections(cRes.collections);
            setCollectionCursor(cRes.pageInfo.endCursor);
            setHasMoreCollections(cRes.pageInfo.hasNextPage);
          }
          return cRes;
        })
        .catch((err) => {
          console.warn("Collections loading error:", err);
        });

      // 3. Blog articles fetch runs concurrently
      const articlesPromise = getBlogArticlesFromShopify({ first: 6 })
        .then((aRes) => {
          if (aRes?.articles?.length > 0) {
            setArticles(aRes.articles);
            setArticleCursor(aRes.pageInfo.endCursor);
            setHasMoreArticles(aRes.pageInfo.hasNextPage);
          }
          return aRes;
        })
        .catch((err) => {
          console.warn("Articles loading error:", err);
        });

      // 4. Background backend config check (non-blocking)
      fetch("/api/shopify/config")
        .then((res) => res.json())
        .then((configData) => {
          if (configData?.config) {
            setStoreDomain(configData.config.storeDomain);
            setIsMockShop(configData.config.isMockShop);
          }
        })
        .catch(() => {});

      await Promise.allSettled([directProductPromise, productsPromise, collectionsPromise, articlesPromise]);
    } catch (e) {
      console.error("Error loading Shopify data:", e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadShopifyData();
  }, []);

  // Fetch a single product by handle directly from Shopify (with caching)
  const fetchProductByHandle = async (handle: string): Promise<Product | null> => {
    if (!handle) return null;
    const existing = products.find((p) => p.handle === handle);
    if (existing) return existing;

    try {
      const fetched = await getProductByHandleFromShopify(handle);
      if (fetched) {
        setProducts((prev) => {
          if (prev.some((p) => p.handle === fetched.handle || p.id === fetched.id)) {
            return prev.map((p) => (p.handle === fetched.handle || p.id === fetched.id ? fetched : p));
          }
          return [fetched, ...prev];
        });
        return fetched;
      }
    } catch (err) {
      console.error(`Error fetching product by handle ${handle}:`, err);
    }
    return null;
  };

  // Fetch Next Products Batch
  const fetchMoreProducts = async () => {
    if (!hasMoreProducts || isFetchingMoreProducts || !productCursor) return;
    setIsFetchingMoreProducts(true);
    try {
      const res = await getProductsFromShopify({ first: 30, after: productCursor });
      if (res.products.length > 0) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newProducts = res.products.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
      setProductCursor(res.pageInfo.endCursor);
      setHasMoreProducts(res.pageInfo.hasNextPage);
    } catch (err) {
      console.error("Error fetching more products:", err);
    } finally {
      setIsFetchingMoreProducts(false);
    }
  };

  // Fetch ALL remaining products progressively until complete
  const fetchAllProducts = async () => {
    let currentHasMore = hasMoreProducts;
    let currentCursor = productCursor;
    while (currentHasMore && currentCursor) {
      setIsFetchingMoreProducts(true);
      try {
        const res = await getProductsFromShopify({ first: 40, after: currentCursor });
        if (res.products.length > 0) {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newProducts = res.products.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newProducts];
          });
        }
        currentCursor = res.pageInfo.endCursor;
        currentHasMore = res.pageInfo.hasNextPage;
        setProductCursor(currentCursor);
        setHasMoreProducts(currentHasMore);
      } catch (err) {
        console.error("Error fetching all products:", err);
        break;
      } finally {
        setIsFetchingMoreProducts(false);
      }
    }
  };

  // Fetch Next Articles Batch
  const fetchMoreArticles = async () => {
    if (!hasMoreArticles || isFetchingMoreArticles || !articleCursor) return;
    setIsFetchingMoreArticles(true);
    try {
      const res = await getBlogArticlesFromShopify({ first: 12, after: articleCursor });
      if (res.articles.length > 0) {
        setArticles((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const newArticles = res.articles.filter((a) => !existingIds.has(a.id));
          return [...prev, ...newArticles];
        });
      }
      setArticleCursor(res.pageInfo.endCursor);
      setHasMoreArticles(res.pageInfo.hasNextPage);
    } catch (err) {
      console.error("Error fetching more articles:", err);
    } finally {
      setIsFetchingMoreArticles(false);
    }
  };

  // Fetch ALL remaining articles progressively until complete
  const fetchAllArticles = async () => {
    let currentHasMore = hasMoreArticles;
    let currentCursor = articleCursor;
    while (currentHasMore && currentCursor) {
      setIsFetchingMoreArticles(true);
      try {
        const res = await getBlogArticlesFromShopify({ first: 20, after: currentCursor });
        if (res.articles.length > 0) {
          setArticles((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newArticles = res.articles.filter((a) => !existingIds.has(a.id));
            return [...prev, ...newArticles];
          });
        }
        currentCursor = res.pageInfo.endCursor;
        currentHasMore = res.pageInfo.hasNextPage;
        setArticleCursor(currentCursor);
        setHasMoreArticles(currentHasMore);
      } catch (err) {
        console.error("Error fetching all articles:", err);
        break;
      } finally {
        setIsFetchingMoreArticles(false);
      }
    }
  };

  // Fetch Next Collections Batch
  const fetchMoreCollections = async () => {
    if (!hasMoreCollections || isFetchingMoreCollections || !collectionCursor) return;
    setIsFetchingMoreCollections(true);
    try {
      const res = await getCollectionsFromShopify({ first: 12, after: collectionCursor });
      if (res.collections.length > 0) {
        setCollections((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newCols = res.collections.filter((c) => !existingIds.has(c.id));
          return [...prev, ...newCols];
        });
      }
      setCollectionCursor(res.pageInfo.endCursor);
      setHasMoreCollections(res.pageInfo.hasNextPage);
    } catch (err) {
      console.error("Error fetching more collections:", err);
    } finally {
      setIsFetchingMoreCollections(false);
    }
  };

  // Fetch ALL remaining collections progressively until complete
  const fetchAllCollections = async () => {
    let currentHasMore = hasMoreCollections;
    let currentCursor = collectionCursor;
    while (currentHasMore && currentCursor) {
      setIsFetchingMoreCollections(true);
      try {
        const res = await getCollectionsFromShopify({ first: 20, after: currentCursor });
        if (res.collections.length > 0) {
          setCollections((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newCols = res.collections.filter((c) => !existingIds.has(c.id));
            return [...prev, ...newCols];
          });
        }
        currentCursor = res.pageInfo.endCursor;
        currentHasMore = res.pageInfo.hasNextPage;
        setCollectionCursor(currentCursor);
        setHasMoreCollections(currentHasMore);
      } catch (err) {
        console.error("Error fetching all collections:", err);
        break;
      } finally {
        setIsFetchingMoreCollections(false);
      }
    }
  };

  // Non-blocking background prefetch task after initial critical load finishes
  useEffect(() => {
    if (!isLoadingData && (hasMoreProducts || hasMoreArticles || hasMoreCollections)) {
      const timer = setTimeout(() => {
        const runBackgroundPrefetch = async () => {
          if (hasMoreProducts && !isFetchingMoreProducts) {
            await fetchMoreProducts();
          }
          if (hasMoreArticles && !isFetchingMoreArticles) {
            await fetchMoreArticles();
          }
          if (hasMoreCollections && !isFetchingMoreCollections) {
            await fetchMoreCollections();
          }
        };
        runBackgroundPrefetch();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoadingData, hasMoreProducts, hasMoreArticles, hasMoreCollections, isFetchingMoreProducts, isFetchingMoreArticles, isFetchingMoreCollections]);

  const updateStoreConfig = async (domain: string, token: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/shopify/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeDomain: domain, storefrontToken: token }),
      });
      const result = await res.json();
      if (result.status === "updated") {
        setStoreDomain(domain);
        setIsMockShop(domain === "mock.shop");
        showToast(`Connected to Shopify store: ${domain}`);
        await loadShopifyData();
        return true;
      }
    } catch (e) {
      showToast("Failed to connect to Shopify store.");
    }
    return false;
  };

  // Navigation helpers
  const navigateToHome = () => setViewState({ type: "home" });
  const navigateToShop = () => setViewState({ type: "shop" });
  const navigateToExploreAll = () => setViewState({ type: "explore_all" });
  const navigateToSale = () => setViewState({ type: "sale" });
  const navigateToProduct = (handle: string) => {
    addRecentlyViewed(handle);
    setViewState({ type: "product", handle });
  };
  const navigateToCollection = (handle: string) => setViewState({ type: "collection", handle });
  const navigateToCollectionsList = () => setViewState({ type: "collections_list" });
  const navigateToBlog = () => setViewState({ type: "blog" });
  const navigateToArticle = (handle: string) => setViewState({ type: "article", handle });
  const navigateToAccount = () => setViewState({ type: "account" });
  const navigateToAbout = () => setViewState({ type: "about" });
  const navigateToContact = () => setViewState({ type: "contact" });
  const navigateToFAQ = () => setViewState({ type: "faq" });
  const navigateToSearch = (query?: string) => setViewState({ type: "search", query });
  const navigateToCart = () => setViewState({ type: "cart" });
  const navigateToCheckout = () => {
    setIsCartOpen(false);
    handleCheckout();
  };
  const navigateToOrderConfirmation = (orderReference: string) => {
    setIsCartOpen(false);
    setViewState({ type: "order_confirmation", orderReference });
  };
  const navigateToPage = (handle: string) => setViewState({ type: "page", handle });

  // ---------------------------------------------------------------------------
  // SHOPIFY STOREFRONT CART MANAGEMENT
  // ---------------------------------------------------------------------------

  const addToCart = (product: Product, variantId?: string, quantity: number = 1) => {
    const selectedVariant = product.variants.find((v) => v.id === variantId) || product.variants[0];
    const actualVariantId = selectedVariant?.id || product.id;
    const formattedVariantGid = ensureVariantGid(actualVariantId);
    const lineId = `${product.id}-${actualVariantId}`;

    setCartLines((prev) => {
      const existing = prev.find(
        (item) => item.id === lineId || item.merchandise.id === formattedVariantGid
      );
      if (existing) {
        return prev.map((item) =>
          item.id === lineId || item.merchandise.id === formattedVariantGid
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const newItem: CartLineItem = {
        id: lineId,
        quantity,
        merchandise: {
          id: formattedVariantGid,
          title: selectedVariant?.title || "Standard",
          product: {
            id: product.id,
            handle: product.handle,
            title: product.title,
            featuredImage: product.featuredImage,
            vendor: product.vendor,
          },
          price: selectedVariant?.price || product.priceRange.minVariantPrice,
          image: selectedVariant?.image || product.featuredImage,
          selectedOptions: selectedVariant?.selectedOptions,
        },
      };
      return [...prev, newItem];
    });

    showToast(`Added "${product.title}" to cart`);
    setIsCartOpen(true);

    // Asynchronously synchronize with Shopify Cart API in background
    if (shopifyCartId) {
      addLinesToShopifyCart(shopifyCartId, [
        { merchandiseId: formattedVariantGid, quantity },
      ])
        .then((updatedCart) => {
          if (updatedCart?.checkoutUrl) {
            setCartCheckoutUrl(updatedCart.checkoutUrl);
          }
        })
        .catch((err) => {
          console.warn("Shopify Cart API sync note:", err);
        });
    }
  };

  const removeFromCart = (lineId: string) => {
    setCartLines((prev) => prev.filter((item) => item.id !== lineId));
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineId);
      return;
    }
    setCartLines((prev) =>
      prev.map((item) => (item.id === lineId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartLines([]);
    setCartCheckoutUrl("");
    try {
      localStorage.removeItem("trt_cart_lines");
    } catch {}
  };

  const cartSubtotal = cartLines.reduce((total, item) => {
    const price = parseFloat(item.merchandise.price.amount) || 0;
    return total + price * item.quantity;
  }, 0);

  const cartCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);

  const applyDiscountCode = (code: string) => {
    const upper = code.trim().toUpperCase();
    if (upper === "REVIVE10" || upper === "GAMER10") {
      setDiscountCode(upper);
      setDiscountPercentage(10);
      showToast("Coupon REVIVE10 applied: 10% OFF!");
    } else if (upper === "VIP20") {
      setDiscountCode(upper);
      setDiscountPercentage(20);
      showToast("VIP Promo VIP20 applied: 20% OFF!");
    } else {
      showToast("Invalid discount code. Try 'REVIVE10'");
    }
  };

  /**
   * Official Headless Shopify Checkout Redirect
   * 1. Generates/Retrieves real Shopify Cart from Storefront Cart API
   * 2. Obtains official checkoutUrl
   * 3. Redirects customer directly to Shopify Web Checkout (shipping, COD, payment, order creation)
   */
  const handleCheckout = async () => {
    if (cartLines.length === 0) {
      showToast("Your cart is empty. Add items to proceed.");
      return;
    }

    setIsCheckingOut(true);
    showToast("Redirecting to official Shopify Checkout...");

    try {
      const result = await getOrCreateShopifyCartCheckoutUrl(cartLines, shopifyCartId);
      if (result && result.checkoutUrl) {
        const finalUrl = result.checkoutUrl;
        setShopifyCartId(result.cartId);
        setCartCheckoutUrl(finalUrl);
        try {
          localStorage.setItem("shopify_cart_id", result.cartId);
        } catch {}

        // Immediate direct navigation to official Shopify Web Checkout
        window.location.href = finalUrl;
        return;
      }
      showToast("Could not initiate Shopify checkout. Please try again.");
    } catch (err: any) {
      console.error("Shopify Checkout Redirect Error:", err);
      showToast("Connection issue with Shopify. Please retry.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Wishlist functions
  const toggleWishlist = (handle: string) => {
    setWishlistHandles((prev) => {
      const exists = prev.includes(handle);
      if (exists) {
        showToast("Removed from Wishlist");
        return prev.filter((h) => h !== handle);
      } else {
        showToast("Saved to Wishlist");
        return [...prev, handle];
      }
    });
  };

  const isInWishlist = (handle: string) => wishlistHandles.includes(handle);

  // Compare functions
  const toggleCompare = (handle: string) => {
    setCompareHandles((prev) => {
      const exists = prev.includes(handle);
      if (exists) {
        showToast("Removed from Compare list");
        return prev.filter((h) => h !== handle);
      } else {
        if (prev.length >= 4) {
          showToast("Maximum 4 products can be compared at once.");
          return prev;
        }
        showToast("Added to Compare list");
        setIsCompareOpen(true);
        return [...prev, handle];
      }
    });
  };

  const isInCompare = (handle: string) => compareHandles.includes(handle);

  const addRecentlyViewed = (handle: string) => {
    setRecentlyViewedHandles((prev) => {
      const filtered = prev.filter((h) => h !== handle);
      return [handle, ...filtered].slice(0, 8);
    });
  };

  // Account login
  const loginCustomer = (email: string, password?: string) => {
    const mockCustomer: Customer = {
      id: "gid://shopify/Customer/99001",
      firstName: email.split("@")[0] || "Gamer",
      lastName: "Tech",
      email,
      phone: "+1 (555) 019-2834",
      orders: [
        {
          id: "ord-1001",
          orderNumber: 1048,
          processedAt: "2026-07-28T14:22:00Z",
          financialStatus: "Paid",
          fulfillmentStatus: "Delivered",
          totalPrice: { amount: "379.98", currencyCode: "USD" },
          lineItems: [
            { title: "Revive Apex Pro Wireless Gaming Mouse", quantity: 1, price: { amount: "159.99", currencyCode: "USD" } },
            { title: "Revive Matrix 65 Magnetic Keyboard", quantity: 1, price: { amount: "219.99", currencyCode: "USD" } },
          ],
        },
      ],
    };
    setCustomer(mockCustomer);
    try {
      localStorage.setItem("trt_customer", JSON.stringify(mockCustomer));
    } catch (e) { console.error(e); }
    showToast(`Welcome back, ${mockCustomer.firstName}!`);
  };

  const logoutCustomer = () => {
    setCustomer(null);
    try {
      localStorage.removeItem("trt_customer");
    } catch (e) { console.error(e); }
    showToast("Logged out of customer account.");
  };

  return (
    <ShopifyContext.Provider
      value={{
        viewState,
        setViewState,
        navigateToHome,
        navigateToShop,
        navigateToExploreAll,
        navigateToSale,
        navigateToProduct,
        navigateToCollection,
        navigateToCollectionsList,
        navigateToBlog,
        navigateToArticle,
        navigateToAccount,
        navigateToAbout,
        navigateToContact,
        navigateToFAQ,
        navigateToSearch,
        navigateToCart,
        navigateToCheckout,
        navigateToOrderConfirmation,
        navigateToPage,
        products,
        collections,
        articles,
        isLoadingData,
        refreshData: loadShopifyData,
        fetchProductByHandle,
        hasMoreProducts,
        isFetchingMoreProducts,
        fetchMoreProducts,
        fetchAllProducts,
        hasMoreArticles,
        isFetchingMoreArticles,
        fetchMoreArticles,
        fetchAllArticles,
        hasMoreCollections,
        isFetchingMoreCollections,
        fetchMoreCollections,
        fetchAllCollections,
        storeDomain,
        isMockShop,
        updateStoreConfig,
        cartLines,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartSubtotal,
        cartCount,
        discountCode,
        applyDiscountCode,
        discountPercentage,
        freeShippingThreshold,
        handleCheckout,
        isCheckingOut,
        shopifyCartId,
        cartCheckoutUrl,
        wishlistHandles,
        toggleWishlist,
        isInWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        compareHandles,
        toggleCompare,
        isInCompare,
        isCompareOpen,
        setIsCompareOpen,
        quickViewHandle,
        setQuickViewHandle,
        isSearchOpen,
        setIsSearchOpen,
        isMobileNavOpen,
        setIsMobileNavOpen,
        recentlyViewedHandles,
        addRecentlyViewed,
        customer,
        isLoggedIn: Boolean(customer),
        loginCustomer,
        logoutCustomer,
        isConfigModalOpen,
        setIsConfigModalOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </ShopifyContext.Provider>
  );
};

export const useShopify = () => {
  const context = useContext(ShopifyContext);
  if (!context) {
    throw new Error("useShopify must be used within a ShopifyProvider");
  }
  return context;
};
