import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const TrendingCategories: React.FC = () => {
  const { collections, navigateToCollection } = useShopify();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Manual navigation only (auto-scroll disabled per user requirement)
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!collections || collections.length === 0) return null;

  return (
    <section
      className="py-14 bg-[#161616] border-b border-emerald-900/30 text-slate-100 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-8 pb-3 border-b border-emerald-900/40">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              EXPLORE STORE DEPARTMENTS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Trending Hardware Categories
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2.5 rounded-lg bg-[#1c1c1c] hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2.5 rounded-lg bg-[#1c1c1c] hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-none select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => navigateToCollection(col.handle)}
              className="min-w-[220px] sm:min-w-[260px] group/colcard relative h-56 rounded-2xl overflow-hidden border border-emerald-900/40 bg-[#1c1c1c] text-left transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] cursor-pointer flex flex-col justify-end p-5"
            >
              {col.image ? (
                <img
                  src={col.image.url}
                  alt={col.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/colcard:scale-110 opacity-60"
                />
              ) : (
                <div className="absolute inset-0 bg-emerald-950" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/50 to-transparent" />

              <div className="relative z-10">
                <h3 className="text-base font-bold text-white group-hover/colcard:text-emerald-300 transition-colors">
                  {col.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
