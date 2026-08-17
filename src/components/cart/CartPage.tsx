import React from "react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney, getOptimizedImageUrl } from "../../lib/utils";
import { YellowTape } from "../common/YellowTape";
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, 
  Truck, Tag, ChevronRight, Lock, Loader2
} from "lucide-react";

export const CartPage: React.FC = () => {
  const { 
    cartLines, updateQuantity, removeFromCart, clearCart, 
    cartSubtotal, freeShippingThreshold, discountCode, applyDiscountCode, 
    discountPercentage, navigateToShop, handleCheckout, isCheckingOut
  } = useShopify();

  const discountAmount = (cartSubtotal * discountPercentage) / 100;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingPct = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  if (cartLines.length === 0) {
    return (
      <div className="w-full bg-[#161616] text-slate-100 min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-10 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-950/80 rounded-full border border-emerald-800/60 flex items-center justify-center mx-auto text-emerald-400">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
            <p className="text-xs text-slate-400">
              Looks like you haven't added any tech hardware to your cart yet.
            </p>
          </div>
          <button
            onClick={navigateToShop}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            Explore Product Catalog <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#161616] text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ""; }} className="hover:text-emerald-400">
            Home
          </a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-emerald-400 font-semibold">Shopping Cart</span>
        </nav>

        {/* Page Title */}
        <div className="flex items-center justify-between border-b border-emerald-900/40 pb-6">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-emerald-400" /> YOUR SHOPPING <YellowTape text="CART" />
          </h1>
          <button
            onClick={clearCart}
            className="text-xs text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        </div>

        {/* Cart Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Line Items Column */}
          <div className="lg:col-span-2 space-y-4">
            {cartLines.map((line) => {
              const price = parseFloat(line.merchandise.price.amount);
              const isDefaultTitle = !line.merchandise.title || line.merchandise.title.toLowerCase() === "default title" || line.merchandise.title.toLowerCase() === "default";

              return (
                <div
                  key={line.id}
                  className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-xl"
                >
                  <img
                    src={getOptimizedImageUrl(line.merchandise.image?.url, 200)}
                    alt={line.merchandise.product.title}
                    loading="lazy"
                    className="w-20 h-20 object-contain bg-[#161616] rounded-xl p-2 border border-emerald-900/60 shrink-0"
                  />

                  <div className="flex-1 space-y-1 text-center sm:text-left w-full">
                    <span className="text-[10px] text-emerald-400 font-mono uppercase">{line.merchandise.product.vendor}</span>
                    <h4 className="font-bold text-white text-sm sm:text-base line-clamp-1">{line.merchandise.product.title}</h4>
                    {!isDefaultTitle && (
                      <p className="text-xs text-slate-400 font-mono">{line.merchandise.title}</p>
                    )}
                    <div className="font-mono font-bold text-emerald-400 text-sm sm:text-base pt-1">
                      {formatMoney(price)}
                    </div>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-[#161616] border border-emerald-900/60 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-white">{line.quantity}</span>
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(line.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Column */}
          <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-6 space-y-6 h-fit shadow-2xl">
            <h3 className="font-bold text-white text-lg border-b border-emerald-900/40 pb-4">Order Summary</h3>

            {/* Discount Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter REVIVE10"
                  defaultValue={discountCode}
                  onChange={(e) => applyDiscountCode(e.target.value)}
                  className="flex-1 bg-[#161616] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 uppercase font-mono"
                />
                <button 
                  onClick={() => applyDiscountCode(discountCode || "REVIVE10")}
                  className="bg-emerald-950 border border-emerald-800 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {discountPercentage > 0 && (
                <p className="text-[10px] text-emerald-400 font-mono">
                  ✓ Promo applied ({discountPercentage}% discount)
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-3 pt-2 text-xs border-t border-emerald-900/40">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-white">{formatMoney(cartSubtotal)}</span>
              </div>

              {discountPercentage > 0 && (
                <div className="flex justify-between text-emerald-400 font-mono">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>-{formatMoney(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Shipping</span>
                <span className="font-mono text-emerald-400">
                  Calculated on checkout
                </span>
              </div>

              <div className="flex justify-between text-slate-100 font-bold text-base pt-3 border-t border-emerald-900/40">
                <span>Estimated Subtotal</span>
                <span className="font-mono text-emerald-400 text-xl">{formatMoney(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-75 disabled:cursor-not-allowed text-slate-950 font-bold py-4 rounded-2xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Redirecting to Shopify...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Official Checkout</span>
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="pt-2 text-center text-[10px] text-slate-400 font-mono space-y-1">
              <p>🔒 256-Bit SSL Encrypted Checkout</p>
              <p>🚚 Express Tracked Delivery Across Pakistan</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
