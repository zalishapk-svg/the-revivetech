import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag, Star, Sparkles } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";

export const RecommendationCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products, addToCart, navigateToProduct } = useShopify();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 bg-[#030e07] border-b border-emerald-900/40 text-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> SLIDER 3 — RECOMMENDED FOR YOU
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Personalized Hardware Recommendations
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-3 bg-emerald-950/80 border border-emerald-800/40 text-slate-300 hover:text-white rounded-xl hover:bg-emerald-900/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-3 bg-emerald-950/80 border border-emerald-800/40 text-slate-300 hover:text-white rounded-xl hover:bg-emerald-900/50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[260px] sm:min-w-[280px] snap-start bg-[#071910] rounded-2xl overflow-hidden border border-emerald-900/40 p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-all"
            >
              <div
                onClick={() => navigateToProduct(product.handle)}
                className="cursor-pointer group"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 mb-3">
                  <img
                    src={product.featuredImage?.url}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{product.vendor}</span>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 truncate mt-0.5">
                  {product.title}
                </h4>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-400 font-bold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{product.rating || 4.9}</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-emerald-900/30 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {formatMoney(product.priceRange.minVariantPrice.amount)}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <ShoppingBag className="w-3 h-3" /> Add
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
