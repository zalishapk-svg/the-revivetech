import React, { useState } from "react";
import { ShieldCheck, Truck, Globe, X } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";

export const AnnouncementBar: React.FC = () => {
  const { freeShippingThreshold, cartSubtotal } = useShopify();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <div className="bg-[#05140b] text-emerald-100 text-xs py-1.5 px-3 sm:px-4 border-b border-emerald-950/60 relative z-40">
      
      {/* DESKTOP TOP BAR (Unchanged for lg screens) */}
      <div className="hidden lg:flex max-w-7xl mx-auto items-center justify-between gap-4">
        {/* Left: Free Shipping / Offer info */}
        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase border border-emerald-500/30 shrink-0">
            PROMO
          </span>
          <p className="flex items-center gap-1.5 font-medium">
            <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {remainingForFreeShipping > 0 ? (
              <span>
                Free Express Shipping on orders over <strong className="text-white">{formatMoney(freeShippingThreshold)}</strong> — Add <strong className="text-emerald-300">{formatMoney(remainingForFreeShipping)}</strong> more!
              </span>
            ) : (
              <span className="text-emerald-300 font-semibold">
                🎉 Congratulations! You qualify for FREE Express Shipping!
              </span>
            )}
          </p>
        </div>

        {/* Center/Right: Store Status & Close */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Authentic Products
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              PKR (Rs.)
            </span>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-emerald-400/60 hover:text-emerald-300 p-0.5 transition-colors"
            aria-label="Close Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET SINGLE-LINE MARQUEE TOP BAR (< lg screens) */}
      <div className="lg:hidden flex items-center justify-between overflow-hidden h-6 text-xs select-none">
        {/* STATIC PROMO LABEL ON LEFT */}
        <div className="flex items-center shrink-0 bg-[#05140b] pr-2 z-10 border-r border-emerald-900/40">
          <span className="bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase border border-emerald-500/30">
            PROMO
          </span>
        </div>

        {/* MOVING MARQUEE TICKER */}
        <div className="overflow-hidden whitespace-nowrap flex-1 relative flex items-center mx-2">
          <div className="animate-marquee-left flex items-center whitespace-nowrap text-[11px] font-medium text-slate-200">
            {/* FIRST PASS */}
            <span className="inline-flex items-center gap-1.5 mx-3">
              <Truck className="w-3 h-3 text-emerald-400 shrink-0" />
              {remainingForFreeShipping > 0 ? (
                <span>Free Express Shipping over <strong className="text-white">{formatMoney(freeShippingThreshold)}</strong></span>
              ) : (
                <span className="text-emerald-300">🎉 FREE Express Shipping Unlocked!</span>
              )}
            </span>
            <span className="text-emerald-600 font-bold">•</span>

            <span className="inline-flex items-center gap-1.5 mx-3">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              100% Authentic Products & Official Brand Warranty
            </span>
            <span className="text-emerald-600 font-bold">•</span>

            <span className="inline-flex items-center gap-1.5 mx-3">
              <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
              Fast Nationwide Delivery Across Pakistan
            </span>
            <span className="text-emerald-600 font-bold">•</span>

            {/* DUPLICATE PASS FOR SEAMLESS 0% -> -50% LOOP */}
            <span className="inline-flex items-center gap-1.5 mx-3">
              <Truck className="w-3 h-3 text-emerald-400 shrink-0" />
              {remainingForFreeShipping > 0 ? (
                <span>Free Express Shipping over <strong className="text-white">{formatMoney(freeShippingThreshold)}</strong></span>
              ) : (
                <span className="text-emerald-300">🎉 FREE Express Shipping Unlocked!</span>
              )}
            </span>
            <span className="text-emerald-600 font-bold">•</span>

            <span className="inline-flex items-center gap-1.5 mx-3">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              100% Authentic Products & Official Brand Warranty
            </span>
            <span className="text-emerald-600 font-bold">•</span>

            <span className="inline-flex items-center gap-1.5 mx-3">
              <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
              Fast Nationwide Delivery Across Pakistan
            </span>
            <span className="text-emerald-600 font-bold">•</span>
          </div>
        </div>

        {/* CLOSE BUTTON FIXED ON RIGHT */}
        <button
          onClick={() => setIsVisible(false)}
          className="shrink-0 bg-[#05140b] pl-1.5 z-10 text-emerald-400/60 hover:text-emerald-300 p-0.5"
          aria-label="Close Announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
