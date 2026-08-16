import React, { useEffect, useState } from "react";
import { useShopify } from "../context/ShopifyContext";
import {
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Lock,
  CheckCircle2,
  Truck,
  CreditCard,
} from "lucide-react";

export const CheckoutPage: React.FC = () => {
  const {
    cartLines,
    cartSubtotal,
    isCheckingOut,
    handleCheckout,
    navigateToCart,
    navigateToShop,
    cartCheckoutUrl,
  } = useShopify();

  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState<boolean>(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  // Automatically initiate Shopify Web Checkout redirect on mount if cart has items
  useEffect(() => {
    if (cartLines.length > 0 && !hasAttemptedRedirect) {
      setHasAttemptedRedirect(true);
      handleCheckout().catch((err) => {
        console.error("Auto checkout redirect error:", err);
        setRedirectError("Unable to open checkout automatically. Please click the button below.");
      });
    }
  }, [cartLines, hasAttemptedRedirect, handleCheckout]);

  // Empty cart state
  if (cartLines.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#161616]">
        <div className="max-w-md w-full text-center bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-zinc-400 text-sm mb-8">
            Add high-performance hardware, keyboards, or audio gear to your cart before proceeding to checkout.
          </p>
          <button
            onClick={navigateToShop}
            className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Explore All Gear</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-[#161616] text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        {/* Main Card */}
        <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Glow Accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6 mb-8">
            <button
              onClick={navigateToCart}
              className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Cart</span>
            </button>
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
              <Lock className="w-3.5 h-3.5" />
              <span>Shopify 256-Bit SSL</span>
            </div>
          </div>

          {/* Checkout Status */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-5">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto text-emerald-400">
                {isCheckingOut ? (
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                ) : (
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                )}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Official Shopify Checkout
            </h1>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              {isCheckingOut
                ? "Connecting directly to Shopify's secure checkout for Cash on Delivery and live carrier rates..."
                : "Redirecting you to complete your order safely on Shopify."}
            </p>
          </div>

          {/* Order Summary Box */}
          <div className="bg-[#161616]/80 border border-zinc-800/80 rounded-2xl p-5 mb-8 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Items in Cart:</span>
              <span className="font-semibold text-white">
                {cartLines.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Cart Subtotal:</span>
              <span className="font-bold text-white text-base">
                Rs. {cartSubtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <Truck className="w-3.5 h-3.5" />
                <span>Shipping & Taxes</span>
              </div>
              <span className="text-zinc-300 font-medium">Calculated directly at Shopify checkout</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment Methods</span>
              </div>
              <span className="text-zinc-300 font-medium">Cash on Delivery (COD) / Cards</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                if (cartCheckoutUrl) {
                  window.location.href = cartCheckoutUrl;
                } else {
                  handleCheckout();
                }
              }}
              disabled={isCheckingOut}
              className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-base rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Connecting to Shopify...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Shopify Checkout</span>
                  <ExternalLink className="w-5 h-5" />
                </>
              )}
            </button>

            {redirectError && (
              <p className="text-amber-400 text-xs text-center font-medium">
                {redirectError}
              </p>
            )}

            <button
              onClick={navigateToShop}
              className="w-full py-3 px-4 bg-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl transition-colors text-center"
            >
              Continue Shopping on TheReviveTech
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-[11px] text-zinc-400">
            <div className="flex flex-col items-center space-y-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Official Shopify Engine</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Nationwide COD</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Warranty Backed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
