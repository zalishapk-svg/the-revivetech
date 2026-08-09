import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const TrendingCategories: React.FC = () => {
  const { collections, navigateToCollection } = useShopify();

  return (
    <section className="py-16 bg-[#05140b] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              EXPLORE STORE DEPARTMENTS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Trending Hardware Categories
            </h2>
          </div>
          <button
            onClick={() => navigateToCollection("gaming-mice")}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-2"
          >
            Explore All Collections <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => navigateToCollection(col.handle)}
              className="group relative h-60 rounded-2xl overflow-hidden border border-emerald-900/40 bg-slate-900 text-left transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)]"
            >
              {col.image ? (
                <img
                  src={col.image.url}
                  alt={col.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60"
                />
              ) : (
                <div className="w-full h-full bg-emerald-950" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                  {col.productsCount || 12} Products
                </span>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mt-0.5">
                  {col.title}
                </h3>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
