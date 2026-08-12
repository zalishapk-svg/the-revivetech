import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";
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

  // Lock body scroll when wishlist is open
  useEffect(() => {
    if (isWishlistOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isWishlistOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isWishlistOpen) {
        setIsWishlistOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWishlistOpen, setIsWishlistOpen]);

  if (!isWishlistOpen) return null;

  const wishlistProducts = products.filter((p) => wishlistHandles.includes(p.handle));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsWishlistOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] max-w-full bg-[#05140b] border-l border-emerald-900/40 text-slate-100 flex flex-col justify-between shadow-2xl h-[100dvh] max-h-[100dvh] overflow-hidden"
        >
          {/* Header (Fixed top, shrink-0) */}
          <div className="p-4 sm:p-5 border-b border-emerald-900/40 bg-emerald-950/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400/20 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-white uppercase font-mono tracking-wider truncate">Your Wishlist</h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                {wishlistProducts.length}
              </span>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-emerald-900/50 transition-colors shrink-0 cursor-pointer"
              aria-label="Close Wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List (Scrollable Body) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
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
                      {formatMoney(product.priceRange?.minVariantPrice?.amount || "0")}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          addToCart(product);
                          setIsWishlistOpen(false);
                        }}
                        className="px-3 py-1 bg-emerald-500 text-slate-950 text-[11px] font-bold rounded-md hover:bg-emerald-400 flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" /> Add to Cart
                      </button>
                      <button
                        onClick={() => {
                          navigateToProduct(product.handle);
                          setIsWishlistOpen(false);
                        }}
                        className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleWishlist(product.handle)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer (Fixed bottom, shrink-0) */}
          {wishlistProducts.length > 0 && (
            <div className="p-4 sm:p-5 bg-emerald-950/60 border-t border-emerald-900/40 shrink-0">
              <button
                onClick={() => {
                  wishlistProducts.forEach((p) => addToCart(p));
                  setIsWishlistOpen(false);
                }}
                className="w-full py-3 bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" /> Add All Wishlist Items to Cart
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

