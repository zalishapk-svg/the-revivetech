import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  image: string;
  url: string;
  alt: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    image: "https://cdn.shopify.com/s/files/1/0610/4642/3631/files/iems.png?v=1786431342",
    url: "https://cdn.shopify.com/s/files/1/0610/4642/3631/files/iems.png?v=1786431342",
    alt: "IEMs Collection Banner",
  },
  {
    id: 2,
    image: "https://cdn.shopify.com/s/files/1/0610/4642/3631/files/nanoleaf.jpg?v=1786431339",
    url: "https://cdn.shopify.com/s/files/1/0610/4642/3631/files/nanoleaf.jpg?v=1786431339",
    alt: "Nanoleaf Lighting Banner",
  },
  {
    id: 3,
    image: "https://cdn.shopify.com/s/files/1/0610/4642/3631/files/edifier_banner.jpg?v=1786431339",
    url: "https://cdn.shopify.com/s/files/1/0610/4642/3631/files/edifier_banner.jpg?v=1786431339",
    alt: "Edifier Audio Banner",
  },
];

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Manual navigation only (auto-scroll disabled per requirement)
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#030705] group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full relative aspect-[16/7] sm:aspect-[21/8] md:aspect-[24/9] max-h-[75vh] min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full absolute inset-0"
          >
            <a
              href={activeSlide.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full relative cursor-pointer"
              title={`View ${activeSlide.alt}`}
            >
              <img
                src={activeSlide.image}
                alt={activeSlide.alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
              />
            </a>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-950/70 hover:bg-emerald-500 text-white hover:text-slate-950 border border-emerald-500/30 backdrop-blur-md transition-all duration-300 opacity-80 group-hover:opacity-100 shadow-xl focus:outline-none"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-950/70 hover:bg-emerald-500 text-white hover:text-slate-950 border border-emerald-500/30 backdrop-blur-md transition-all duration-300 opacity-80 group-hover:opacity-100 shadow-xl focus:outline-none"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2.5">
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                idx === currentSlide
                  ? "w-8 sm:w-10 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                  : "w-2 sm:w-2.5 bg-slate-400/40 hover:bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
