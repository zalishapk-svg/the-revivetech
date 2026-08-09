import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlistHandles,
    toggleWishlist,
    products,
    addToCart,
    navigateToProduct,
  } = useShopify();

  if (!isWishlistOpen) return null;

  const wishlistProducts = products.filter((p) => wishlistHandles.includes(p.handle));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsWishlistOpen(false)}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-screen max-w-md bg-[#05140b] border-l border-emerald-900/40 text-slate-100 flex flex-col justify-between shadow-2xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-emerald-900/40 bg-emerald-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider">Your Wishlist</h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {wishlistProducts.length}
                </span>
              </div>
              <button onClick={() => setIsWishlistOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Heart className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="font-bold text-white text-base">No Saved Items</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Click the heart icon on any product card to save gear for later.
                  </p>
                </div>
              ) : (
                wishlistProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-3 p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl items-center"
                  >
                    <img
                      src={product.featuredImage?.url}
                      alt={product.title}
                      className="w-16 h-16 rounded-lg object-cover bg-slate-900 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{product.title}</h4>
                      <p className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5">
                        {formatMoney(product.priceRange.minVariantPrice.amount)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            addToCart(product);
                            setIsWishlistOpen(false);
                          }}
                          className="px-3 py-1 bg-emerald-500 text-slate-950 text-[11px] font-bold rounded-md hover:bg-emerald-400 flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3 h-3" /> Add to Cart
                        </button>
                        <button
                          onClick={() => {
                            navigateToProduct(product.handle);
                            setIsWishlistOpen(false);
                          }}
                          className="text-[11px] text-slate-300 hover:text-white underline"
                        >
                          View
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleWishlist(product.handle)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {wishlistProducts.length > 0 && (
              <div className="p-5 bg-emerald-950/60 border-t border-emerald-900/40">
                <button
                  onClick={() => {
                    wishlistProducts.forEach((p) => addToCart(p));
                    setIsWishlistOpen(false);
                  }}
                  className="w-full py-3 bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Add All Wishlist Items to Cart
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
