import React, { useState, useEffect, useMemo } from "react";
import { SlidersHorizontal, ShoppingBag, Heart, Layers, Eye, Star, Check, Loader2, ChevronRight, RefreshCw, Search } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { getCollectionByHandleFromShopify } from "../../lib/shopify";
import { formatMoney, calculateDiscount } from "../../lib/utils";
import { Collection, Product } from "../../types";
import { OffCanvasDrawer } from "../common/OffCanvasDrawer";
import { ProductCard } from "../common/ProductCard";

interface CollectionPageProps {
  handle: string;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({ handle }) => {
  const {
    collections,
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    setQuickViewHandle,
    navigateToProduct,
    navigateToCollection,
  } = useShopify();

  const [liveCollection, setLiveCollection] = useState<Collection | null>(null);
  const [isLoadingCollection, setIsLoadingCollection] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Requirement: EXACTLY 12 products per page
  const itemsPerPage = 12;

  // Initialize page number from URL search parameter ?page=N
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const p = parseInt(params.get("page") || "1", 10);
      return !isNaN(p) && p > 0 ? p : 1;
    }
    return 1;
  });

  // Keep page number in sync with URL search parameter
  useEffect(() => {
    const syncPageFromUrl = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const p = parseInt(params.get("page") || "1", 10);
      setCurrentPage(!isNaN(p) && p > 0 ? p : 1);
    };

    window.addEventListener("popstate", syncPageFromUrl);
    return () => window.removeEventListener("popstate", syncPageFromUrl);
  }, []);

  // Update URL search parameter when page or filters change
  const updatePageUrl = (newPage: number) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (newPage > 1) {
      url.searchParams.set("page", newPage.toString());
    } else {
      url.searchParams.delete("page");
    }
    window.history.pushState({ page: newPage }, "", url.toString());
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updatePageUrl(newPage);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Reset page when collection handle changes
  useEffect(() => {
    setCurrentPage(1);
  }, [handle]);

  useEffect(() => {
    let isMounted = true;
    if (handle) {
      setIsLoadingCollection(true);
      
      const loadCollectionProgressively = async () => {
        try {
          // Initial batch (fast critical load)
          const firstPage = await getCollectionByHandleFromShopify(handle, { first: 30 });
          if (!isMounted) return;

          if (firstPage && firstPage.collection) {
            setLiveCollection(firstPage.collection);
            setIsLoadingCollection(false);

            // Progressive background loading for remaining pages of this collection
            let hasNext = firstPage.pageInfo.hasNextPage;
            let cursor = firstPage.pageInfo.endCursor;

            while (hasNext && cursor && isMounted) {
              const nextPage = await getCollectionByHandleFromShopify(handle, { first: 30, after: cursor });
              if (!isMounted) break;

              if (nextPage && nextPage.collection && nextPage.collection.products.length > 0) {
                const newProds = nextPage.collection.products;
                setLiveCollection((prev) => {
                  if (!prev) return nextPage.collection;
                  const existingIds = new Set(prev.products.map((p) => p.id));
                  const filtered = newProds.filter((p) => !existingIds.has(p.id));
                  const combined = [...prev.products, ...filtered];
                  return {
                    ...prev,
                    products: combined,
                    productsCount: combined.length,
                  };
                });
              }

              hasNext = nextPage.pageInfo.hasNextPage;
              cursor = nextPage.pageInfo.endCursor;
            }
          } else {
            setIsLoadingCollection(false);
          }
        } catch (err) {
          console.error("Error loading collection progressively:", err);
          if (isMounted) setIsLoadingCollection(false);
        }
      };

      loadCollectionProgressively();
    }
    return () => { isMounted = false; };
  }, [handle]);

  const collection = liveCollection || collections.find((c) => c.handle === handle) || collections[0];
  
  // Use products specific to this collection
  const baseProducts = (liveCollection?.products && liveCollection.products.length > 0)
    ? liveCollection.products
    : (collection?.products && collection.products.length > 0)
    ? collection.products
    : products;

  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  const maxProductPriceInCollection = useMemo(() => {
    if (baseProducts.length === 0) return 200000;
    return Math.max(...baseProducts.map((p) => parseFloat(p.priceRange.minVariantPrice.amount) || 0));
  }, [baseProducts]);

  const [maxPrice, setMaxPrice] = useState<number>(1000000);

  // Update maxPrice when collection changes so all items show by default
  useEffect(() => {
    if (maxProductPriceInCollection > 0) {
      setMaxPrice(Math.max(500000, maxProductPriceInCollection));
    }
  }, [maxProductPriceInCollection]);

  // Filtering products
  const filteredProducts = useMemo(() => {
    let list = [...baseProducts];
    if (selectedVendor !== "all") {
      list = list.filter((p) => p.vendor === selectedVendor);
    }
    list = list.filter(
      (p) => parseFloat(p.priceRange.minVariantPrice.amount) <= maxPrice
    );

    // Sorting
    if (sortBy === "price-asc") {
      list.sort((a, b) => parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [baseProducts, selectedVendor, maxPrice, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  // Only render the 12 products belonging to the current page
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const resetCollectionFilters = () => {
    setSelectedVendor("all");
    setMaxPrice(Math.max(500000, maxProductPriceInCollection));
    setSortBy("featured");
    handlePageChange(1);
  };

  const vendors = Array.from(new Set(baseProducts.map((p) => p.vendor)));

  // Reusable Sidebar Form Controls
  const renderCollectionSidebar = (onItemSelect?: () => void) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between font-bold text-sm text-white uppercase font-mono pb-3 border-b border-emerald-900/40">
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" /> Filter Collection
        </span>
        <button
          onClick={resetCollectionFilters}
          className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Vendor Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase font-mono block">Vendor / Brand:</label>
        <select
          value={selectedVendor}
          onChange={(e) => {
            setSelectedVendor(e.target.value);
            handlePageChange(1);
            if (onItemSelect) onItemSelect();
          }}
          className="w-full p-2.5 bg-slate-950 border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
        >
          <option value="all">All Vendors ({baseProducts.length})</option>
          {vendors.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold font-mono">
          <span className="text-slate-300">Max Price:</span>
          <span className="text-emerald-400">
            {formatMoney(maxPrice.toString(), baseProducts[0]?.priceRange?.minVariantPrice?.currencyCode || "PKR")}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.max(500000, maxProductPriceInCollection)}
          step="5000"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(Number(e.target.value));
            handlePageChange(1);
          }}
          className="w-full accent-emerald-500 cursor-pointer"
        />
      </div>

      {/* Other Collections Quick List */}
      <div className="space-y-2 pt-4 border-t border-emerald-900/40">
        <label className="text-xs font-bold text-slate-300 uppercase font-mono block">All Collections:</label>
        <ul className="space-y-1 text-xs">
          {collections.map((col) => (
            <li key={col.id}>
              <button
                onClick={() => {
                  navigateToCollection(col.handle);
                  if (onItemSelect) onItemSelect();
                }}
                className={`w-full text-left py-1.5 px-3 rounded-xl transition-colors cursor-pointer font-mono flex items-center justify-between ${
                  col.handle === handle 
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md" 
                    : "text-slate-400 hover:text-white hover:bg-emerald-950/60"
                }`}
              >
                <span>{col.title}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-[#030e07] text-slate-100 min-h-screen py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner Header */}
        <div className="bg-[#071910] border border-emerald-800/50 p-6 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              <span>Collection Catalog</span>
              <span>•</span>
              <span className="text-slate-300">/collections/{handle}</span>
            </div>
            <h1 className="text-2xl sm:text-5xl font-black text-white">{collection.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {collection.description || `Browse our official ${collection.title} catalog with full specs, warranty, and fast delivery across Pakistan.`}
            </p>
          </div>
        </div>

        {/* Filters & Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-[#071910] border border-emerald-800/40 p-6 rounded-3xl h-fit shadow-xl lg:sticky lg:top-24">
            {renderCollectionSidebar()}
          </aside>

          {/* Off-Canvas Drawer for Mobile/Tablet */}
          <OffCanvasDrawer
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
            title="Filter Hardware & Categories"
          >
            {renderCollectionSidebar(() => setIsMobileFilterOpen(false))}
          </OffCanvasDrawer>

          {/* Product Grid Area */}
          <main className="lg:col-span-9 space-y-6 w-full">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#071910] border border-emerald-800/40 p-4 rounded-2xl text-xs font-mono shadow-md">
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                {/* Mobile/Tablet Filter Trigger Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filter & Categories</span>
                </button>

                <span className="text-slate-400">
                  Showing <strong className="text-white">{paginatedProducts.length}</strong> of {filteredProducts.length} Products (Page {currentPage} of {totalPages})
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-400">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    handlePageChange(1);
                  }}
                  className="bg-slate-950 border border-emerald-800/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoadingCollection && baseProducts.length === 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#071910] border border-emerald-900/40 rounded-2xl p-4 space-y-3 animate-pulse">
                    <div className="aspect-square bg-emerald-950/60 rounded-xl" />
                    <div className="h-4 w-2/3 bg-emerald-950/50 rounded" />
                    <div className="h-3 w-full bg-emerald-950/30 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-[#071910] border border-emerald-800/40 rounded-3xl p-12 text-center space-y-3">
                <Search className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Products Found</h3>
                <p className="text-xs text-slate-400">No hardware matching your active filter criteria was found in this collection.</p>
                <button
                  onClick={resetCollectionFilters}
                  className="bg-emerald-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg cursor-pointer"
                >
                  Reset Collection Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 mt-8 border-t border-emerald-900/40 flex items-center justify-center gap-2 flex-wrap">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  className="px-4 py-2 rounded-xl bg-[#071910] border border-emerald-900/60 text-xs font-mono font-bold text-slate-300 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20"
                        : "bg-[#071910] border border-emerald-900/60 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  className="px-4 py-2 rounded-xl bg-[#071910] border border-emerald-900/60 text-xs font-mono font-bold text-slate-300 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
