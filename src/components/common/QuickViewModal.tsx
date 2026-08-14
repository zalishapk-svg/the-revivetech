import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Heart, Star, Check, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney, calculateDiscount, hasCompareAtDiscount } from "../../lib/utils";
import { getProductReviews } from "../../lib/reviews";

export const QuickViewModal: React.FC = () => {
  const { quickViewHandle, setQuickViewHandle, products, addToCart, toggleWishlist, isInWishlist, navigateToProduct } = useShopify();
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  // Lock body scroll when QuickView is active
  useEffect(() => {
    if (quickViewHandle) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [quickViewHandle]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && quickViewHandle) {
        setQuickViewHandle(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickViewHandle, setQuickViewHandle]);

  if (!quickViewHandle) return null;

  const product = products.find((p) => p.handle === quickViewHandle) || products[0];

  if (!product) return null;

  const isWishlisted = isInWishlist(product.handle);

  const priceAmount = product.priceRange?.minVariantPrice?.amount || "0.00";
  const compareAtAmount = product.compareAtPriceRange?.minVariantPrice?.amount;
  const hasDiscount = hasCompareAtDiscount(priceAmount, compareAtAmount);
  const discountPercent = hasDiscount ? calculateDiscount(priceAmount, compareAtAmount) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQuickViewHandle(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl bg-[#071910] border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 z-50 my-8"
        >
          <button
            onClick={() => setQuickViewHandle(null)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900/80 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Image Gallery Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-emerald-900/40 aspect-square">
              <img
                src={product.featuredImage?.url}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
                  SAVE {discountPercent}%
                </span>
              )}
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                  {product.vendor}
                </span>
                <h2 className="text-xl font-extrabold text-white leading-tight mt-1">{product.title}</h2>
                {(() => {
                  const revs = getProductReviews(product);
                  return (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.round(revs.averageRating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-white font-mono">{revs.averageRating}</span>
                      <span className="text-slate-400">({revs.totalReviews} reviews)</span>
                    </div>
                  );
                })()}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {formatMoney(priceAmount)}
                </span>
                {hasDiscount && compareAtAmount && (
                  <span className="text-sm line-through text-slate-500 font-mono">
                    {formatMoney(compareAtAmount)}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Variant Selector */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">{product.options[0].name}:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.options[0].values.map((val, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariantId(product.variants[idx]?.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          selectedVariantId === product.variants[idx]?.id || idx === 0
                            ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                            : "bg-emerald-950/40 text-slate-300 border-emerald-800/40 hover:border-emerald-500/40"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={!product.availableForSale}
                  onClick={() => {
                    if (!product.availableForSale) return;
                    addToCart(product, selectedVariantId, quantity);
                    setQuickViewHandle(null);
                  }}
                  className={`flex-1 py-3 font-black text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg ${
                    product.availableForSale
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50 cursor-pointer"
                      : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" /> {product.availableForSale ? "Add to Cart" : "Out of Stock"}
                </button>

                <button
                  onClick={() => toggleWishlist(product.handle)}
                  className={`p-3 rounded-xl border transition-colors ${
                    isWishlisted ? "bg-rose-950/60 border-rose-500 text-rose-400" : "bg-emerald-950/40 border-emerald-800/40 text-slate-300 hover:text-white"
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-400" : ""}`} />
                </button>
              </div>

              <button
                onClick={() => {
                  navigateToProduct(product.handle);
                  setQuickViewHandle(null);
                }}
                className="w-full text-center text-xs font-bold text-emerald-400 hover:underline pt-2 block"
              >
                View Full Product Page & Specifications →
              </button>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
