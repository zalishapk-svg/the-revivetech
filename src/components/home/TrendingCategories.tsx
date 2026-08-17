import React, { useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { Collection } from "../../types";

export const TrendingCategories: React.FC = () => {
  const { collections, navigateToCollection } = useShopify();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount = direction === "left" ? -containerWidth * 0.75 : containerWidth * 0.75;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Priority ordering definition:
  // 1. Headsets, 2. Keyboards, 3. Mice, 4. Microphones, 5. Gaming Chairs, 6. Speakers, 7. Buds, 8. Accessories
  // Followed by all remaining existing collections in their current available order.
  const orderedCollections = useMemo(() => {
    if (!collections || collections.length === 0) return [];

    const priorityMatchers: ((col: Collection) => boolean)[] = [
      // 1. Headsets
      (c) => {
        const t = c.title.toLowerCase();
        const h = c.handle.toLowerCase();
        return t.includes("headset") || h.includes("headset");
      },
      // 2. Keyboards
      (c) => {
        const t = c.title.toLowerCase();
        const h = c.handle.toLowerCase();
        return t.includes("keyboard") || h.includes("keyboard");
      },
      // 3. Mice
      (c) => {
        const t = c.title.toLowerCase();
        const h = c.handle.toLowerCase();
        return t.includes("mice") || t.includes("mouse") || h.includes("mice") || h.includes("mouse");
      },
      // 4. Microphones
      (c) => {
        const t = c.title.toLowerCase();
        const h = c.handle.toLowerCase();
        return t.includes("microphone") || t.includes("mic") || h.includes("microphone") || h.includes("mic");
      },
      // 5. Gaming Chairs
      (c) => {
        const t = c.title.toLowerCase();
        const h = c.handle.toLowerCase();
        return t.includes("chair") || h.includes("chair");
      },
      // 6. Speakers
      (c) => {
        const t = c.title.toLowerCase();
        const h = c.handle.toLowerCase();
        return t.includes("speaker") || h.includes("speaker");
      },
      // 7. Buds
      (c) => {
        const t = c.title.toLowerCase();
        const h = c.handle.toLowerCase();
        return t.includes("bud") || h.includes("bud") || t.includes("iem") || h.includes("iem");
      },
      // 8. Accessories
      (c) => {
        const t = c.title.toLowerCase();
        const h = c.handle.toLowerCase();
        return t.includes("accessor") || h.includes("accessor");
      },
    ];

    const matchedSet = new Set<string>();
    const prioritized: Collection[] = [];

    // Find and order priority categories 1 to 8
    priorityMatchers.forEach((matcher) => {
      const match = collections.find(
        (col) => !matchedSet.has(col.id || col.handle) && matcher(col)
      );
      if (match) {
        prioritized.push(match);
        matchedSet.add(match.id || match.handle);
      }
    });

    // Append all remaining existing collections in their current available order
    const remaining = collections.filter(
      (col) => !matchedSet.has(col.id || col.handle)
    );

    return [...prioritized, ...remaining];
  }, [collections]);

  if (!orderedCollections || orderedCollections.length === 0) return null;

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

        {/* Circular Categories Track - 6 on desktop (lg), 4 on tablet (sm/md), 3 on mobile */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto pb-4 scrollbar-none select-none snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {orderedCollections.map((col) => (
            <div
              key={col.id}
              onClick={() => navigateToCollection(col.handle)}
              className="w-[calc((100%-24px)/3)] sm:w-[calc((100%-48px)/4)] md:w-[calc((100%-60px)/4)] lg:w-[calc((100%-120px)/6)] shrink-0 group flex flex-col items-center text-center cursor-pointer snap-start"
            >
              {/* Circular Avatar Container */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-30 lg:h-30 xl:w-36 xl:h-36 rounded-full overflow-hidden border-2 border-emerald-900/50 group-hover:border-emerald-400 bg-[#1c1c1c] relative transition-all duration-300 shadow-md group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] p-1">
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
              <h3 className="mt-2 sm:mt-3 text-[11px] sm:text-xs md:text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-2 w-full px-1">
                {col.title}
              </h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};


