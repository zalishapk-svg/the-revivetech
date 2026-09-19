import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Product } from "../../types";
import { ProductCard } from "./ProductCard";
import { ProductSkeletonCard } from "./ProductSkeletonCard";

interface ProductCarouselProps {
  title?: string;
  subtitle?: string;
  products: Product[];
  isLoading?: boolean;
  onViewAll?: () => void;
  viewAllText?: string;
  badgeText?: string;
  autoPlayInterval?: number;
  initialLimit?: number;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  isLoading = false,
  onViewAll,
  viewAllText = "View All",
  badgeText,
  initialLimit = 5,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initial paint optimization: Render first 5 products immediately,
  // then populate the rest of the slider track in background after initial render.
  useEffect(() => {
    if (products.length > 0) {
      const timer = setTimeout(() => {
        setIsExpanded(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [products.length]);

  const displayedProducts = isExpanded ? products : products.slice(0, initialLimit);

  // Manual navigation only (auto-scroll disabled per user requirement)
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -340 : 340;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <section
      className="py-10 bg-[#161616] border-b border-emerald-900/30 text-slate-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        {(title || badgeText) && (
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-emerald-900/40">
            <div>
              {badgeText && (
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/90 px-2.5 py-0.5 rounded border border-emerald-800/40 inline-block mb-1">
                  {badgeText}
                </span>
              )}
              {title && (
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-slate-400 mt-1 max-w-xl">{subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {onViewAll && (
                <button
                  onClick={onViewAll}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 hover:underline focus:outline-none group transition-colors"
                >
                  {viewAllText}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              )}

              {/* Controls */}
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => scroll("left")}
                  aria-label="Scroll left"
                  className="p-2 rounded-lg bg-[#1c1c1c] hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  aria-label="Scroll right"
                  className="p-2 rounded-lg bg-[#1c1c1c] hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Carousel Slider Track */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex items-stretch gap-3 sm:gap-6 overflow-x-auto scrollbar-none py-2 px-0.5 select-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {isLoading ? (
              [...Array(initialLimit)].map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="flex-none w-[calc(50%-6px)] sm:w-[280px] md:w-[295px] lg:w-[310px] xl:w-[330px] 2xl:w-[360px] 3xl:w-[400px] 4xl:w-[440px]"
                >
                  <ProductSkeletonCard />
                </div>
              ))
            ) : (
              displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-none w-[calc(50%-6px)] sm:w-[280px] md:w-[295px] lg:w-[310px] xl:w-[330px] 2xl:w-[360px] 3xl:w-[400px] 4xl:w-[440px]"
                >
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};


