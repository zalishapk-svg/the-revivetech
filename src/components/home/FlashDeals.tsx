import React, { useState, useEffect } from "react";
import { Zap, ShoppingBag, Eye, Heart, Layers, Clock } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney, calculateDiscount } from "../../lib/utils";

export const FlashDeals: React.FC = () => {
  const { products, addToCart, setQuickViewHandle, navigateToProduct } = useShopify();

  // Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashDealProduct = products.find((p) => p.isFlashDeal || p.handle.includes("qd-oled")) || products[2] || products[0];

  if (!flashDealProduct) {
    return null;
  }

  const price = flashDealProduct.priceRange?.minVariantPrice?.amount || "0.00";
  const compareAt = flashDealProduct.compareAtPriceRange?.minVariantPrice?.amount;
  const discountPercent = calculateDiscount(price, compareAt);

  return (
    <section className="py-16 bg-[#05140b] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-800/50 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Countdown Details */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="flex items-center gap-2">
                <span className="bg-rose-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-rose-950/50">
                  <Zap className="w-3.5 h-3.5 fill-white" /> FLASH SALE ENDS IN
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                {flashDealProduct.title}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                {flashDealProduct.description}
              </p>

              {/* Countdown Digital Timer */}
              <div className="flex items-center gap-3 pt-2">
                <div className="bg-slate-950 border border-emerald-800/60 p-3 rounded-2xl text-center min-w-[70px]">
                  <span className="block font-mono text-2xl font-black text-emerald-400">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Hours</span>
                </div>
                <span className="text-xl font-bold text-emerald-500">:</span>
                <div className="bg-slate-950 border border-emerald-800/60 p-3 rounded-2xl text-center min-w-[70px]">
                  <span className="block font-mono text-2xl font-black text-emerald-400">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Mins</span>
                </div>
                <span className="text-xl font-bold text-emerald-500">:</span>
                <div className="bg-slate-950 border border-emerald-800/60 p-3 rounded-2xl text-center min-w-[70px]">
                  <span className="block font-mono text-2xl font-black text-rose-400 animate-pulse">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Secs</span>
                </div>
              </div>

              {/* Limited Inventory Stock Bar */}
              <div className="space-y-1.5 max-w-md pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Limited Stock Available:</span>
                  <span className="text-rose-400 font-bold">Only 7 Units Remaining!</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-emerald-900/40">
                  <div className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full w-[82%]" />
                </div>
              </div>

              {/* Price & Add Button */}
              <div className="pt-2 flex items-center gap-4">
                <div>
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    {formatMoney(price)}
                  </span>
                  {compareAt && (
                    <span className="block text-xs line-through text-slate-400 font-mono">
                      {formatMoney(compareAt)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => addToCart(flashDealProduct)}
                  className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-colors shadow-xl shadow-emerald-950/60 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Claim Flash Deal
                </button>
              </div>

            </div>

            {/* Right Column: High-Res Image Preview */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-emerald-800/50 aspect-square shadow-2xl">
                <img
                  src={flashDealProduct.featuredImage?.url}
                  alt={flashDealProduct.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 right-4 bg-rose-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  SAVE {discountPercent}% NOW
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
