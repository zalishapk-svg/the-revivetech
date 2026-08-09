import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Gamepad2, Monitor, Laptop, Cpu, Headphones, Armchair, Sparkles } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

const CATEGORY_SLIDES = [
  {
    title: "Esports Mice",
    tag: "49g Carbon Fiber",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    handle: "gaming-mice",
  },
  {
    title: "Rapid Trigger Keyboards",
    tag: "Hall-Effect 0.1mm",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    handle: "gaming-keyboards",
  },
  {
    title: "QD-OLED Displays",
    tag: "360Hz 4K UHD",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    handle: "monitors",
  },
  {
    title: "RTX 5090 Laptops",
    tag: "Liquid Cooled Loop",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
    handle: "laptops",
  },
  {
    title: "Planar Audio Headsets",
    tag: "90mm Drivers",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    handle: "gaming-headsets",
  },
  {
    title: "Processors & GPUs",
    tag: "Zen 5 / PCIe 5.0",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80",
    handle: "pc-components",
  },
];

export const TechCategoriesSlider: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { navigateToCollection } = useShopify();

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 bg-[#030e07] border-b border-emerald-900/40 text-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation Arrows */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> SLIDER 2 — TECH CATEGORIES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Technology Hardware Spectrum
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-3 bg-emerald-950/80 border border-emerald-800/40 text-slate-300 hover:text-white rounded-xl hover:bg-emerald-900/50 transition-colors"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-3 bg-emerald-950/80 border border-emerald-800/40 text-slate-300 hover:text-white rounded-xl hover:bg-emerald-900/50 transition-colors"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Card Slider Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORY_SLIDES.map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigateToCollection(item.handle)}
              className="min-w-[280px] sm:min-w-[320px] snap-start group relative h-80 rounded-2xl overflow-hidden border border-emerald-900/40 bg-slate-900 cursor-pointer transition-all duration-300 hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] flex flex-col justify-end p-6"
            >
              <img
                src={item.image}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="relative z-10">
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded tracking-widest uppercase mb-2 inline-block">
                  {item.tag}
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-2 group-hover:translate-x-1 transition-transform">
                  Explore Collection <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
