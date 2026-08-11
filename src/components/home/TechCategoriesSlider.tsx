import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const TechCategoriesSlider: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { collections, navigateToCollection } = useShopify();
  const [isPaused, setIsPaused] = useState(false);

  // Manual navigation only (auto-scroll disabled per user requirement)
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!collections || collections.length === 0) return null;

  return (
    <section
      className="py-14 bg-slate-950 border-b border-emerald-900/30 text-slate-100 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Navigation Controls */}
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-emerald-900/40">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/90 px-2.5 py-0.5 rounded border border-emerald-800/40 inline-flex items-center gap-1.5 mb-1.5">
              <Layers className="w-3.5 h-3.5" /> LIVE SHOPIFY CATALOG
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Technology Hardware Spectrum
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Browse authentic gaming hardware categories sourced dynamically from our Shopify Storefront.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Collection Spectrum Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-none select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {collections.map((col) => {
            const bgImage =
              col.image?.url ||
              col.products?.[0]?.featuredImage?.url ||
              col.products?.[0]?.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                key={col.id}
                onClick={() => navigateToCollection(col.handle)}
                className="min-w-[240px] sm:min-w-[280px] group/colcard relative h-64 rounded-2xl overflow-hidden border border-emerald-900/40 bg-slate-900 cursor-pointer transition-all duration-300 hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] flex flex-col justify-end p-5"
              >
                <img
                  src={bgImage}
                  alt={col.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/colcard:scale-110 opacity-55 group-hover/colcard:opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white group-hover/colcard:text-emerald-300 transition-colors line-clamp-1">
                    {col.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
