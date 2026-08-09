import React from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

const GUIDES = [
  {
    title: "How to Choose the Right Polling Rate (1000Hz vs 8000Hz)",
    readTime: "5 min read",
    category: "Hardware Specs",
    handle: "polling-rate-guide",
  },
  {
    title: "QD-OLED vs WOLED: Subpixel Layouts & Text Clarity for Coding & Gaming",
    readTime: "8 min read",
    category: "Display Technology",
    handle: "qd-oled-guide",
  },
  {
    title: "Rapid Trigger Actuation Tuning for Tactical Shooters",
    readTime: "6 min read",
    category: "Esports Optimization",
    handle: "rapid-trigger-guide",
  },
];

export const BuyingGuides: React.FC = () => {
  const { navigateToBlog } = useShopify();

  return (
    <section className="py-16 bg-[#05140b] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> HARDWARE KNOWLEDGE BASE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Esports Buyer Guides & Specs
            </h2>
          </div>
          <button onClick={navigateToBlog} className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
            Read All Articles <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GUIDES.map((g, i) => (
            <div
              key={i}
              onClick={navigateToBlog}
              className="bg-[#071910] border border-emerald-900/40 p-6 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition-all space-y-3"
            >
              <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 font-bold">
                <span>{g.category}</span>
                <span className="text-slate-400">{g.readTime}</span>
              </div>
              <h3 className="text-sm font-bold text-white hover:text-emerald-300 transition-colors leading-snug">
                {g.title}
              </h3>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 pt-2">
                Read Guide →
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
