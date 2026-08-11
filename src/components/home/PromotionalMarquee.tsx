import React from "react";
import { Zap, ShieldCheck, Truck, Sparkles, Award, Headphones, ShieldAlert, Cpu } from "lucide-react";

interface PromotionalMarqueeProps {
  className?: string;
}

export const PromotionalMarquee: React.FC<PromotionalMarqueeProps> = ({
  className = "",
}) => {
  const topRowItems = [
    { icon: Zap, text: "AUTHENTIC GAMING GEAR" },
    { icon: Truck, text: "EXPRESS NATIONWIDE SHIPPING" },
    { icon: ShieldCheck, text: "VERIFIED ORIGINAL HARDWARE" },
    { icon: Sparkles, text: "PREMIUM CUSTOMER SUPPORT" },
    { icon: Award, text: "OFFICIAL WARRANTY & SUPPORT" },
  ];

  const bottomRowItems = [
    { icon: ShieldAlert, text: "100% ORIGINAL PRODUCTS" },
    { icon: Headphones, text: "EXPERT HARDWARE ADVICE" },
    { icon: Cpu, text: "LATEST ESPORTS TECH DROPS" },
    { icon: Truck, text: "CASH ON DELIVERY PAKISTAN" },
    { icon: Zap, text: "KARACHI • LAHORE • ISLAMABAD" },
  ];

  return (
    <div className={`my-10 relative overflow-hidden py-4 space-y-3 ${className}`}>
      {/* Background Glow Field */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12)_0%,transparent_75%)] pointer-events-none" />

      {/* TOP MARQUEE: RIGHT -> LEFT */}
      <div className="w-[106%] -ml-[3%] transform -rotate-1 sm:-rotate-1.5 bg-gradient-to-r from-[#02180c] via-[#064e29] to-[#011409] border-y border-emerald-400/50 shadow-[0_4px_20px_rgba(16,185,129,0.25)] py-2.5 relative z-10 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee-left items-center gap-8">
          {[...Array(4)].map((_, loopIdx) => (
            <div key={`top-${loopIdx}`} className="flex items-center gap-8 shrink-0">
              {topRowItems.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div key={itemIdx} className="flex items-center gap-2.5 text-slate-950 font-black font-mono text-xs sm:text-sm tracking-widest uppercase">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-950 flex items-center justify-center text-emerald-400 border border-emerald-500/40 shadow">
                      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <span className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      {item.text}
                    </span>
                    <span className="text-emerald-400 font-bold ml-4">•</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM MARQUEE: LEFT -> RIGHT (Opposing direction & tilt) */}
      <div className="w-[106%] -ml-[3%] transform rotate-1 sm:rotate-1.5 bg-gradient-to-r from-[#011409] via-[#0a5830] to-[#02180c] border-y border-emerald-400/50 shadow-[0_4px_20px_rgba(16,185,129,0.25)] py-2.5 relative z-10 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee-right items-center gap-8">
          {[...Array(4)].map((_, loopIdx) => (
            <div key={`bottom-${loopIdx}`} className="flex items-center gap-8 shrink-0">
              {bottomRowItems.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div key={itemIdx} className="flex items-center gap-2.5 text-slate-950 font-black font-mono text-xs sm:text-sm tracking-widest uppercase">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-950 flex items-center justify-center text-emerald-400 border border-emerald-500/40 shadow">
                      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <span className="text-emerald-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      {item.text}
                    </span>
                    <span className="text-emerald-400 font-bold ml-4">•</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

