import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const TrendingCategories: React.FC = () => {
  const { collections, navigateToCollection } = useShopify();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!collections || collections.length === 0) return null;

  return (
    <section className="py-12 bg-[#161616] border-b border-emerald-900/30 text-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-8 pb-3 border-b border-emerald-900/40">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              EXPLORE STORE DEPARTMENTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Trending Hardware Categories
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2.5 rounded-xl bg-[#1c1c1c] hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none cursor-pointer"
              aria-label="Previous Categories"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2.5 rounded-xl bg-[#1c1c1c] hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none cursor-pointer"
              aria-label="Next Categories"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Circular Categories Track - 6 visible on desktop (lg) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-none select-none snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => navigateToCollection(col.handle)}
              className="min-w-[130px] sm:min-w-[150px] md:min-w-[160px] lg:w-[calc((100%-120px)/6)] shrink-0 group flex flex-col items-center text-center cursor-pointer snap-start"
            >
              {/* Circular Avatar Container */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-30 md:h-30 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-full overflow-hidden border-2 border-emerald-900/50 group-hover:border-emerald-400 bg-[#1c1c1c] relative transition-all duration-300 shadow-md group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#161616] relative">
                  {col.image ? (
                    <img
                      src={col.image.url}
                      alt={col.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-950/60 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase">
                      {col.title.slice(0, 3)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                </div>
              </div>

              {/* Category Title */}
              <h3 className="mt-3 text-xs sm:text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-2 max-w-[140px]">
                {col.title}
              </h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

