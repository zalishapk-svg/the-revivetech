import React from "react";
import { Heart, Layers, Eye, ShoppingBag, Star, Zap } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney, calculateDiscount } from "../../lib/utils";

export const BestSellers: React.FC = () => {
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

  const bestSellerProducts = products.filter((p) => p.isBestSeller || p.rating! >= 4.8);

  return (
    <section className="py-16 bg-[#030e07] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono inline-flex items-center gap-1 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800/40 mb-2">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" /> MOST POPULAR GEAR
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Best Selling Esports Hardware</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Engineered for maximum competitive precision, rated 4.9★ by over 50,000 verified gamers worldwide.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellerProducts.map((product) => {
            const isWishlisted = isInWishlist(product.handle);
            const isCompared = isInCompare(product.handle);
            const price = product.priceRange.minVariantPrice.amount;
            const compareAt = product.compareAtPriceRange?.minVariantPrice?.amount;
            const discountPercent = calculateDiscount(price, compareAt);

            return (
              <div
                key={product.id}
                className="group bg-[#071910] rounded-2xl overflow-hidden border border-emerald-900/40 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(16,185,129,0.12)] flex flex-col justify-between"
              >
                {/* Image Container & Floating Actions */}
                <div className="relative aspect-square overflow-hidden bg-slate-900">
                  {product.featuredImage && (
                    <img
                      src={product.featuredImage.url}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    {discountPercent > 0 && (
                      <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                        -{discountPercent}%
                      </span>
                    )}
                    {product.isNewArrival && (
                      <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                        JUST LANDED
                      </span>
                    )}
                  </div>

                  {/* Action Buttons on Hover */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => toggleWishlist(product.handle)}
                      className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                        isWishlisted ? "bg-rose-950/80 text-rose-400" : "bg-slate-950/80 text-slate-300 hover:text-white"
                      }`}
                      title="Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-400" : ""}`} />
                    </button>

                    <button
                      onClick={() => toggleCompare(product.handle)}
                      className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                        isCompared ? "bg-amber-950/80 text-amber-400" : "bg-slate-950/80 text-slate-300 hover:text-white"
                      }`}
                      title="Compare specs"
                    >
                      <Layers className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setQuickViewHandle(product.handle)}
                      className="p-2 rounded-xl bg-slate-950/80 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Info Body */}
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

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mt-2 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-white text-xs">{product.rating || 4.9}</span>
                      <span className="text-slate-500 text-[11px]">({product.reviewsCount} reviews)</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="pt-4 mt-3 border-t border-emerald-900/30 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {formatMoney(price)}
                      </span>
                      {compareAt && (
                        <span className="block text-[11px] line-through text-slate-500 font-mono">
                          {formatMoney(compareAt)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="py-2 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
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
