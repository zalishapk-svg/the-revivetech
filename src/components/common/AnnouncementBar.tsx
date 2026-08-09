import React, { useState } from "react";
import { Zap, ShieldCheck, Truck, Globe, Settings, X } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";

export const AnnouncementBar: React.FC = () => {
  const { freeShippingThreshold, cartSubtotal } = useShopify();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <div className="bg-[#05140b] text-emerald-100 text-xs py-2 px-4 border-b border-emerald-950/60 relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        
        {/* Left: Free Shipping / Offer info */}
        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase border border-emerald-500/30">
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

        {/* Center/Right: Store Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/80 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Store Connected</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 border-l border-emerald-800/40 pl-3">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Official 3-Year Warranty
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              PKR (Rs.)
            </span>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-emerald-400/60 hover:text-emerald-300 p-0.5"
            aria-label="Close Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
