import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Heart } from "lucide-react";

const BATTLESTATIONS = [
  {
    title: "Minimalist Cyberpunk Studio",
    author: "@tech_nexus",
    likes: "2.4k",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Dual 360Hz QD-OLED Command Center",
    author: "@apex_esports",
    likes: "1.9k",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Carbon Fiber Ultra-Lightweight Rig",
    author: "@fps_god",
    likes: "3.1k",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
  },
];

export const CommunityStories: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 bg-[#030e07] border-b border-emerald-900/40 text-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> SLIDER 4 — BATTLESTATIONS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Community Setup Gallery
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => scroll("left")} className="p-3 bg-emerald-950 border border-emerald-800 text-slate-300 hover:text-white rounded-xl">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll("right")} className="p-3 bg-emerald-950 border border-emerald-800 text-slate-300 hover:text-white rounded-xl">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
          {BATTLESTATIONS.map((b, i) => (
            <div key={i} className="min-w-[300px] snap-start relative h-80 rounded-2xl overflow-hidden border border-emerald-900/40 group">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
                <div>
                  <h4 className="text-sm font-bold text-white">{b.title}</h4>
                  <span className="text-xs text-emerald-400 font-mono">{b.author}</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-rose-400 font-bold bg-slate-950/80 px-2 py-1 rounded">
                  <Heart className="w-3.5 h-3.5 fill-rose-400" /> {b.likes}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
