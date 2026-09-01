import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

interface Slide {
  id: number;
  image: string;
  url: string;
  handle: string;
  alt: string;
}

const SECOND_SLIDES: Slide[] = [
  {
    id: 1,
    image: "https://cdn.shopify.com/s/files/1/0610/4642/3631/files/easysmx_banner_design.jpg?v=1786431339",
    url: "/collections/controllers",
    handle: "controllers",
    alt: "Gaming Controllers Collection Banner",
  },
  {
    id: 2,
    image: "https://cdn.shopify.com/s/files/1/0610/4642/3631/files/Andaset_banner_copy.jpg?v=1786431339",
    url: "/collections/gaming-chairs",
    handle: "gaming-chairs",
    alt: "Gaming Chairs Collection Banner",
  },
];

export const SecondSlider: React.FC = () => {
  const { navigateToCollection } = useShopify();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SECOND_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SECOND_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SECOND_SLIDES.length) % SECOND_SLIDES.length);
  };

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

  const activeSlide = SECOND_SLIDES[currentSlide];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#161616] group select-none border-t border-b border-emerald-900/30 my-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full relative min-h-[200px] sm:min-h-[320px] md:min-h-[440px] lg:min-h-[520px] xl:min-h-[600px] flex items-center justify-center">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{
              duration: 1.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full h-full absolute inset-0 will-change-transform"
          >
            <a
              href={activeSlide.url}
              onClick={(e) => {
                e.preventDefault();
                navigateToCollection(activeSlide.handle);
              }}
              className="block w-full h-full relative cursor-pointer overflow-hidden flex items-center justify-center"
              title={`View ${activeSlide.alt}`}
            >
              <img
                src={activeSlide.image}
                alt={activeSlide.alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover sm:object-contain object-center"
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
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-[#1c1c1c]/80 hover:bg-emerald-500 text-white hover:text-slate-950 border border-emerald-500/30 backdrop-blur-md transition-all duration-300 opacity-80 group-hover:opacity-100 shadow-xl focus:outline-none cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-[#1c1c1c]/80 hover:bg-emerald-500 text-white hover:text-slate-950 border border-emerald-500/30 backdrop-blur-md transition-all duration-300 opacity-80 group-hover:opacity-100 shadow-xl focus:outline-none cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2.5">
          {SECOND_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
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
