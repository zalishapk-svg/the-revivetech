import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Zap, ShieldCheck, Sparkles, Play } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { YellowTape } from "../common/YellowTape";

const HERO_SLIDES = [
  {
    id: 1,
    tag: "FLAGSHIP RELEASE",
    headline: "DOMINATE EVERY",
    highlightWord: "FRAME",
    subheadline: "49 Grams. True 8000Hz Polling. Carbon Fiber Chassis.",
    productTitle: "Revive Apex Pro Wireless Gaming Mouse",
    price: "$159.99",
    comparePrice: "$199.99",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1600&q=80",
    productHandle: "revive-apex-pro-wireless-mouse",
  },
  {
    id: 2,
    tag: "DISPLAY REVOLUTION",
    headline: "NEXT-GEN 360HZ",
    highlightWord: "QD-OLED",
    subheadline: "32-inch 4K UHD. 0.03ms GTG Response Time. True Black 400.",
    productTitle: "Revive Quantum 360Hz QD-OLED Monitor",
    price: "$1199.99",
    comparePrice: "$1399.99",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1600&q=80",
    productHandle: "revive-quantum-360-qd-oled-monitor",
  },
  {
    id: 3,
    tag: "UNRIVALED SPEED",
    headline: "RAPID TRIGGER",
    highlightWord: "MAGNETIC",
    subheadline: "0.1mm Adjustable Actuation. CNC Anodized Aluminum Enclosure.",
    productTitle: "Revive Matrix 65% Hall-Effect Keyboard",
    price: "$219.99",
    comparePrice: "$269.99",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1600&q=80",
    productHandle: "revive-matrix-65-magnetic-keyboard",
  },
];

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { navigateToProduct } = useShopify();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative h-[85vh] min-h-[600px] max-h-[850px] bg-[#030e07] overflow-hidden text-white border-b border-emerald-900/40">
      
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {/* Background Image with Layered Gradient Vignette */}
          <img
            src={slide.image}
            alt={slide.productTitle}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30 scale-105 filter brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030e07] via-[#030e07]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030e07] via-transparent to-transparent" />
          
          {/* Ambient Lighting Glow */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Content Container */}
          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl space-y-6">
              
              {/* Editorial Tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-emerald-950/80 text-emerald-400 font-black text-xs px-3.5 py-1.5 rounded-full border border-emerald-500/40 uppercase tracking-widest"
              >
                <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                <span>{slide.tag}</span>
              </motion.div>

              {/* Headline with Yellow Highlight Tape Effect */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] text-white"
              >
                {slide.headline}{" "}
                <YellowTape>{slide.highlightWord}</YellowTape>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed"
              >
                {slide.subheadline}
              </motion.p>

              {/* Price Callout & CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-2 flex flex-wrap items-center gap-4"
              >
                <div className="flex items-baseline gap-2 bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-800/40">
                  <span className="text-2xl font-black text-emerald-400 font-mono">{slide.price}</span>
                  <span className="text-xs text-slate-400 line-through font-mono">{slide.comparePrice}</span>
                </div>

                <button
                  onClick={() => navigateToProduct(slide.productHandle)}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-2xl shadow-emerald-950 transition-all flex items-center gap-3 group"
                >
                  <span>Shop Hardware Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Controls & Progress Indicator */}
      <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentSlide ? "w-12 bg-emerald-400" : "w-3 bg-emerald-900/60 hover:bg-emerald-700"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-slate-300 hover:text-white hover:bg-emerald-900/60"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-slate-300 hover:text-white hover:bg-emerald-900/60"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

    </section>
  );
};
