import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Product } from "../../types";
import { ProductCard } from "./ProductCard";

interface ProductCarouselProps {
  title?: string;
  subtitle?: string;
  products: Product[];
  onViewAll?: () => void;
  viewAllText?: string;
  badgeText?: string;
  autoPlayInterval?: number;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  onViewAll,
  viewAllText = "View All",
  badgeText,
  autoPlayInterval = 4500,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Smooth continuous auto-scroll logic
  useEffect(() => {
    if (!scrollRef.current) return;
    let animId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (!isPaused && scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Scroll speed ~ 40px/sec
        const speed = (40 * delta) / 1000;
        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += speed;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, products.length]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -340 : 340;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!products || products.length === 0) return null;

  return (
    <section
      className="py-10 bg-slate-950/60 border-b border-emerald-900/30 text-slate-100"
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
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => scroll("left")}
                  aria-label="Scroll left"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  aria-label="Scroll right"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none"
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
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-2 px-0.5 select-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-none w-[240px] sm:w-[280px] md:w-[290px] lg:w-[295px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
