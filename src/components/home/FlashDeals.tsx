import React, { useState, useEffect } from "react";
import { Zap, Clock } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { ProductCarousel } from "../common/ProductCarousel";

export const FlashDeals: React.FC = () => {
  const { products, isLoadingData, navigateToShop } = useShopify();

  // Filter ONLY products that have an actual compare-at price higher than their current price
  const saleProducts = products.filter((p) => {
    const price = parseFloat(p.priceRange?.minVariantPrice?.amount || "0");
    const compareAt = parseFloat(p.compareAtPriceRange?.minVariantPrice?.amount || "0");
    return compareAt > price;
  });

  // If no specific compare-at items exist, show products
  const displayProducts = saleProducts.length > 0 ? saleProducts : products.slice(0, 8);

  // Live Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 42, seconds: 15 });

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

  return (
    <div className="relative">
      {/* Top Flash Sale Countdown Banner */}
      <div className="bg-emerald-950/80 border-y border-emerald-800/40 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-emerald-400 animate-pulse text-emerald-400" />
            <span>LIMITED TIME HARDWARE FLASH DEALS</span>
          </div>

          <div className="flex items-center gap-2 text-slate-200">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Offer expires in:</span>
            <div className="flex items-center gap-1 font-bold text-emerald-300 bg-slate-900 px-2 py-0.5 rounded border border-emerald-800/50">
              <span>{String(timeLeft.hours).padStart(2, "0")}h</span>
              <span>:</span>
              <span>{String(timeLeft.minutes).padStart(2, "0")}m</span>
              <span>:</span>
              <span className="text-rose-400 animate-pulse">{String(timeLeft.seconds).padStart(2, "0")}s</span>
            </div>
          </div>
        </div>
      </div>

      <ProductCarousel
        title="Flash Sale Hardware"
        subtitle="Exclusive price drops on authentic gaming gear. Updated dynamically from live Shopify inventory."
        badgeText="UP TO 30% OFF"
        products={displayProducts}
        isLoading={isLoadingData}
        onViewAll={navigateToShop}
        viewAllText="View All Sale Items"
      />
    </div>
  );
};
