import React, { useState, useEffect, useMemo } from "react";
import { SlidersHorizontal, ShoppingBag, Heart, Layers, Eye, Star, Check, Loader2 } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { getCollectionByHandleFromShopify } from "../../lib/shopify";
import { formatMoney, calculateDiscount } from "../../lib/utils";
import { Collection, Product } from "../../types";

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
  let collectionProducts = [...baseProducts];
  if (selectedVendor !== "all") {
    collectionProducts = collectionProducts.filter((p) => p.vendor === selectedVendor);
  }
  collectionProducts = collectionProducts.filter(
    (p) => parseFloat(p.priceRange.minVariantPrice.amount) <= maxPrice
  );

  // Sorting
  if (sortBy === "price-asc") {
    collectionProducts.sort((a, b) => parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount));
  } else if (sortBy === "price-desc") {
    collectionProducts.sort((a, b) => parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount));
  } else if (sortBy === "rating") {
    collectionProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  const vendors = Array.from(new Set(baseProducts.map((p) => p.vendor)));

  return (
    <div className="bg-[#030e07] text-slate-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner Header */}
        <div className="bg-[#071910] border border-emerald-800/50 p-8 sm:p-10 rounded-3xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              COLLECTION LANDING PAGE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white">{collection.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {collection.description}
            </p>
          </div>
        </div>

        {/* Filters & Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Filter Sidebar */}
          <div className="lg:col-span-3 space-y-6 bg-[#071910] border border-emerald-800/40 p-6 rounded-3xl h-fit">
            <div className="flex items-center gap-2 font-bold text-sm text-white uppercase font-mono pb-3 border-b border-emerald-900/40">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" /> Filter Hardware
            </div>

            {/* Vendor Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase font-mono">Vendor / Brand:</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="all">All Vendors ({products.length})</option>
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
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Other Collections Quick List */}
            <div className="space-y-2 pt-4 border-t border-emerald-900/40">
              <label className="text-xs font-bold text-slate-300 uppercase font-mono">Other Collections:</label>
              <ul className="space-y-1.5 text-xs">
                {collections.map((col) => (
                  <li key={col.id}>
                    <button
                      onClick={() => navigateToCollection(col.handle)}
                      className={`w-full text-left py-1 px-2.5 rounded-lg transition-colors ${
                        col.handle === handle ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {col.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#071910] border border-emerald-800/40 p-4 rounded-2xl text-xs font-mono">
              <span className="text-slate-400">
                Showing <strong className="text-white">{collectionProducts.length}</strong> Products
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-emerald-800/40 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collectionProducts.map((product) => {
                const isWishlisted = isInWishlist(product.handle);
                const isCompared = isInCompare(product.handle);
                const price = product.priceRange?.minVariantPrice?.amount || "0.00";
                const compareAt = product.compareAtPriceRange?.minVariantPrice?.amount;
                const discountPercent = calculateDiscount(price, compareAt);

                return (
                  <div
                    key={product.id}
                    className="group bg-[#071910] rounded-2xl overflow-hidden border border-emerald-900/40 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-900">
                      <img
                        src={product.featuredImage?.url}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => toggleWishlist(product.handle)}
                          className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                            isWishlisted ? "bg-rose-950/80 text-rose-400" : "bg-slate-950/80 text-slate-300 hover:text-white"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-400" : ""}`} />
                        </button>
                        <button
                          onClick={() => toggleCompare(product.handle)}
                          className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                            isCompared ? "bg-amber-950/80 text-amber-400" : "bg-slate-950/80 text-slate-300 hover:text-white"
                          }`}
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setQuickViewHandle(product.handle)}
                          className="p-2 rounded-xl bg-slate-950/80 text-slate-300 hover:text-white backdrop-blur-md"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                          {product.vendor}
                        </span>
                        <button
                          onClick={() => navigateToProduct(product.handle)}
                          className="text-left block text-sm font-bold text-white hover:text-emerald-300 transition-colors mt-0.5 line-clamp-1"
                        >
                          {product.title}
                        </button>
                      </div>

                      <div className="pt-4 mt-3 border-t border-emerald-900/30 flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-emerald-400">
                          {formatMoney(price)}
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          className="py-2 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
