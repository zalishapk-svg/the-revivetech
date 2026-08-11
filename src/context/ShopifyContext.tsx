import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Collection, BlogArticle, CartLineItem, ViewState, Customer } from "../types";
import { getProductsFromShopify, getCollectionsFromShopify, getBlogArticlesFromShopify } from "../lib/shopify";

interface ShopifyContextType {
  // Navigation View State
  viewState: ViewState;
  setViewState: (view: ViewState) => void;
  navigateToHome: () => void;
  navigateToShop: () => void;
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
  navigateToPage: (handle: string) => void;

  // Shopify Storefront Data
  products: Product[];
  collections: Collection[];
  articles: BlogArticle[];
  isLoadingData: boolean;
  refreshData: () => Promise<void>;

  // Live Shopify Store Domain Config
  storeDomain: string;
  isMockShop: boolean;
  updateStoreConfig: (domain: string, token: string) => Promise<boolean>;

  // Cart Management
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

  // Recently Viewed
  recentlyViewedHandles: string[];
  addRecentlyViewed: (handle: string) => void;

  // Customer Account
  customer: Customer | null;
  isLoggedIn: boolean;
  loginCustomer: (email: string) => void;
  logoutCustomer: () => void;

  // Shopify Config Bar Modal
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

export function parseUrlToViewState(path: string, search: string): ViewState {
  const cleanPath = path.replace(/\/$/, "");
  if (!cleanPath || cleanPath === "") return { type: "home" };
  if (cleanPath === "/shop") return { type: "shop" };
  if (cleanPath === "/collections" || cleanPath === "/collections/") return { type: "collections_list" };
  if (cleanPath.startsWith("/collections/")) {
    const handle = cleanPath.replace("/collections/", "");
    if (handle) return { type: "collection", handle };
  }
  if (cleanPath.startsWith("/products/")) {
    const handle = cleanPath.replace("/products/", "");
    if (handle) return { type: "product", handle };
  }
  if (cleanPath === "/cart") return { type: "cart" };
  if (cleanPath === "/search") {
    const query = new URLSearchParams(search).get("q") || "";
    return { type: "search", query };
  }
  if (cleanPath === "/about") return { type: "about" };
  if (cleanPath === "/contact") return { type: "contact" };
  if (cleanPath === "/blog") return { type: "blog" };
  if (cleanPath.startsWith("/blog/")) {
    const handle = cleanPath.replace("/blog/", "");
    if (handle) return { type: "article", handle };
  }
  if (cleanPath === "/account") return { type: "account" };
  if (cleanPath === "/faq") return { type: "faq" };
  if (cleanPath.startsWith("/page/")) {
    const handle = cleanPath.replace("/page/", "");
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
    case "collections_list":
      return "/collections";
    case "collection":
      return `/collections/${view.handle}`;
    case "product":
      return `/products/${view.handle}`;
    case "cart":
      return "/cart";
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const newView = parseUrlToViewState(window.location.pathname, window.location.search);
      setViewStateInternal(newView);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const [storeDomain, setStoreDomain] = useState<string>("dbbys1-nd.myshopify.com");
  const [isMockShop, setIsMockShop] = useState<boolean>(false);

  // Cart State
  const [cartLines, setCartLines] = useState<CartLineItem[]>(() => {
    try {
      const saved = localStorage.getItem("trt_cart_lines");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
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

  // Load Shopify Data
  const loadShopifyData = async () => {
    setIsLoadingData(true);
    try {
      const prods = await getProductsFromShopify();
      const cols = await getCollectionsFromShopify();
      const arts = await getBlogArticlesFromShopify();
      setProducts(prods);
      setCollections(cols);
      setArticles(arts);

      // Check current backend config
      const res = await fetch("/api/shopify/config");
      const configData = await res.json();
      if (configData.config) {
        setStoreDomain(configData.config.storeDomain);
        setIsMockShop(configData.config.isMockShop);
      }
    } catch (e) {
      console.error("Error loading Shopify data:", e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadShopifyData();
  }, []);

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
  const navigateToPage = (handle: string) => setViewState({ type: "page", handle });

  // Cart functions
  const addToCart = (product: Product, variantId?: string, quantity: number = 1) => {
    const selectedVariant = product.variants.find((v) => v.id === variantId) || product.variants[0];
    const lineId = `${product.id}-${selectedVariant?.id || "default"}`;

    setCartLines((prev) => {
      const existing = prev.find((item) => item.id === lineId);
      if (existing) {
        return prev.map((item) =>
          item.id === lineId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      const newItem: CartLineItem = {
        id: lineId,
        quantity,
        merchandise: {
          id: selectedVariant?.id || product.id,
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

  const clearCart = () => setCartLines([]);

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
  const loginCustomer = (email: string) => {
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
        navigateToPage,
        products,
        collections,
        articles,
        isLoadingData,
        refreshData: loadShopifyData,
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
