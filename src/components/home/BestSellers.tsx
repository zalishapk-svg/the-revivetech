import React from "react";
import { Zap } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { ProductCard } from "../common/ProductCard";
import { formatMoney, calculateDiscount } from "../../lib/utils";

export const BestSellers: React.FC = () => {
  const {
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    setQuickViewHandle,
    navigateToProduct,
  } = useShopify();

  const bestSellerProducts = products.filter((p) => p.isBestSeller || (p.rating && p.rating >= 4.8));
  const displayProducts = bestSellerProducts.length > 0 ? bestSellerProducts : products.slice(0, 8);

  return (
    <section className="py-16 bg-[#030e07] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono inline-flex items-center gap-1 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800/40 mb-2">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" /> MOST POPULAR GEAR
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Best Selling Esports Hardware</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Engineered for maximum competitive precision, rated 4.9★ by over 50,000 verified gamers worldwide.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};
