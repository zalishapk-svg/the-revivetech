import React from "react";
import { Zap, ShieldCheck, Truck, Sparkles } from "lucide-react";

export const PromotionalMarquee: React.FC = () => {
  const marqueeItems = [
    "FREE EXPRESS SHIPPING ACROSS PAKISTAN ON ORDERS OVER RS. 15,000",
    "100% GENUINE & AUTHORIZED TECH HARDWARE",
    "OFFICIAL 3-YEAR LOCAL WARRANTY",
    "SAME-DAY DISPATCH IN LAHORE & KARACHI",
    "CASH ON DELIVERY (COD) AVAILABLE NATIONWIDE",
    "24/7 BATTLESTATION TECH SUPPORT"
  ];

  return (
    <div className="relative w-full overflow-hidden py-8 my-6">
      {/* Tilted Container Strip */}
      <div className="w-[120%] -ml-[10%] transform -rotate-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 text-slate-950 py-3 shadow-2xl border-y border-emerald-300">
        
        {/* Continuous Horizontal Infinite Marquee */}
        <div className="flex whitespace-nowrap overflow-hidden select-none">
          {/* Duplicate 3 times for seamless infinite looping */}
          {[...Array(3)].map((_, loopIdx) => (
            <div key={loopIdx} className="flex items-center gap-8 animate-marquee shrink-0">
              {marqueeItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-6">
                  <span className="font-black text-xs sm:text-sm tracking-wider uppercase font-mono text-slate-950">
                    {item}
                  </span>
                  <Sparkles className="w-4 h-4 text-slate-900 fill-slate-950" />
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>

      {/* Marquee Animation CSS inline style fallback */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};
