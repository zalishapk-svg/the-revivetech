import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, Tag, ExternalLink, ArrowRight, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney, getOptimizedImageUrl } from "../../lib/utils";

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartLines,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartCount,
    discountCode,
    applyDiscountCode,
    discountPercentage,
    freeShippingThreshold,
    products,
    navigateToProduct,
    storeDomain,
    handleCheckout,
    isCheckingOut,
  } = useShopify();

  const [inputCode, setInputCode] = useState("");

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isCartOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const discountAmount = (cartSubtotal * discountPercentage) / 100;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  // Suggested accessories add-ons
  const addOnProducts = products.filter((p) => p.productType === "Accessories" || p.tags.includes("Accessories")).slice(0, 2);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
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
          {/* Drawer Header (Fixed top, shrink-0) */}
          <div className="p-4 sm:p-5 border-b border-emerald-900/40 bg-emerald-950/40 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-white uppercase font-mono tracking-wider truncate">
                  Your Cart
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                  {cartCount} {cartCount === 1 ? "Item" : "Items"}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-emerald-900/50 transition-colors shrink-0 cursor-pointer"
                aria-label="Close Cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="mt-3.5 bg-slate-900 p-3 rounded-xl border border-emerald-900/30">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium gap-2">
                <span className="flex items-center gap-1.5 text-slate-300 truncate">
                  <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {remainingForFreeShipping === 0 ? "Free Express Shipping Unlocked!" : `Add ${formatMoney(remainingForFreeShipping)} for Free Express Shipping`}
                  </span>
                </span>
                <span className="font-mono text-emerald-400 font-bold shrink-0">{Math.round(freeShippingProgressPercent)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cart Line Items (Scrollable Body) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
            {cartLines.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto border border-emerald-800/40">
                  <ShoppingBag className="w-8 h-8 text-emerald-500/60" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Your Cart is Empty</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Explore our high-performance esports peripherals, QD-OLED monitors, and PC components.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="py-2.5 px-6 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartLines.map((line) => (
                <div
                  key={line.id}
                  className="flex gap-3 p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl relative group"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-emerald-900/40">
                    {line.merchandise.image ? (
                      <img
                        src={getOptimizedImageUrl(line.merchandise.image.url, 200)}
                        alt={line.merchandise.product.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                        TRT
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {line.merchandise.product.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Variant: <span className="text-emerald-300 font-medium">{line.merchandise.title}</span>
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {formatMoney(line.merchandise.price.amount)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-emerald-800/60 rounded-lg bg-slate-950 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity - 1)}
                          className="p-1 hover:bg-emerald-900/50 text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity + 1)}
                          className="p-1 hover:bg-emerald-900/50 text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(line.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}

            {/* Recommended Add-ons inside Cart */}
            {cartLines.length > 0 && addOnProducts.length > 0 && (
              <div className="pt-4 border-t border-emerald-900/30">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Frequently Added Accessories
                </h4>
                <div className="space-y-2">
                  {addOnProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-emerald-950/30 rounded-lg border border-emerald-900/20 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <img src={p.featuredImage?.url} alt={p.title} className="w-8 h-8 rounded object-cover" />
                        <span className="truncate font-medium text-slate-200">{p.title}</span>
                      </div>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          navigateToProduct(p.handle);
                        }}
                        className="text-[11px] text-emerald-400 font-bold hover:underline shrink-0 ml-2 cursor-pointer"
                      >
                        + View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Footer / Checkout Summary */}
          {cartLines.length > 0 && (
            <div className="p-4 sm:p-5 bg-emerald-950/60 border-t border-emerald-900/40 space-y-3 shrink-0">
              
              {/* Discount Code Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Discount code (e.g. REVIVE10)"
                    className="w-full pl-8 pr-2 py-1.5 bg-slate-950 border border-emerald-800/40 rounded-lg text-xs text-white uppercase placeholder:normal-case focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={() => {
                    applyDiscountCode(inputCode);
                    setInputCode("");
                  }}
                  className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 font-bold text-xs rounded-lg border border-emerald-700/40 cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {discountCode && (
                <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
                  <span>Code {discountCode} ({discountPercentage}% OFF)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Subtotal Calculation */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-200">{formatMoney(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-medium">
                    {remainingForFreeShipping === 0 ? "FREE" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-emerald-900/40">
                  <span>Estimated Total</span>
                  <span className="font-mono text-emerald-400 text-base">{formatMoney(finalTotal)}</span>
                </div>
              </div>

              {/* Proceed to Checkout */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Proceed to Checkout</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Secure Cash on Delivery • 256-bit SSL Encrypted</span>
              </div>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

