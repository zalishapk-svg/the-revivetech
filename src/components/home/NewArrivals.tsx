import React from "react";
import { Sparkles, ShoppingBag, Heart, Layers, Eye, Star } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney, calculateDiscount } from "../../lib/utils";

export const NewArrivals: React.FC = () => {
  const {
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    setQuickViewHandle,
    navigateToProduct,
  } = useShopify();

  const filteredNew = products.filter((p) => p.isNewArrival || p.tags.includes("New Drop")).slice(0, 4);
  const newProducts = filteredNew.length > 0 ? filteredNew : products.slice(0, 4);

  return (
    <section className="py-16 bg-[#05140b] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800/40 w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> FRESH DROPS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Just Landed Hardware</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Updated live from Shopify Admin API</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newProducts.map((product) => {
            const isWishlisted = isInWishlist(product.handle);
            const isCompared = isInCompare(product.handle);
            const price = product.priceRange?.minVariantPrice?.amount || "0.00";
            const compareAt = product.compareAtPriceRange?.minVariantPrice?.amount;
            const discountPercent = calculateDiscount(price, compareAt);

            return (
              <div
                key={product.id}
                className="group bg-[#071910] rounded-2xl overflow-hidden border border-emerald-900/40 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-900">
                  {product.featuredImage?.url && (
                    <img
                      src={product.featuredImage.url}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                      JUST LANDED
                    </span>
                  </div>

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
                    <div>
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {formatMoney(price)}
                      </span>
                    </div>
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
    </section>
  );
};
