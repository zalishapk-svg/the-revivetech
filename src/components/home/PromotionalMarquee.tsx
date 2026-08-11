import React from "react";
import { Zap, ShieldCheck, Truck, Sparkles } from "lucide-react";

interface PromotionalMarqueeProps {
  message?: string;
  className?: string;
}

export const PromotionalMarquee: React.FC<PromotionalMarqueeProps> = ({
  message = "AUTHENTIC GAMING GEAR • FAST NATIONWIDE DELIVERY IN PAKISTAN • OFFICIAL WARRANTY & SUPPORT • NEW DROPS WEEKLY",
  className = "",
}) => {
  const items = [
    { icon: Zap, text: "AUTHENTIC GAMING GEAR" },
    { icon: Truck, text: "EXPRESS NATIONWIDE SHIPPING" },
    { icon: ShieldCheck, text: "VERIFIED ORIGINAL HARDWARE" },
    { icon: Sparkles, text: "PREMIUM CUSTOMER SUPPORT" },
  ];

  return (
    <div className={`my-8 relative overflow-hidden py-3 ${className}`}>
      {/* Tilted Gradient Marquee Container */}
      <div className="w-[105%] -ml-[2.5%] transform -rotate-1 sm:-rotate-1.5 bg-gradient-to-r from-emerald-950 via-emerald-600 to-teal-900 border-y-2 border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.3)] py-3 relative z-10 overflow-hidden">
        
        {/* Glowing Background Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.25)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex whitespace-nowrap animate-marquee items-center gap-8">
          {[...Array(4)].map((_, loopIdx) => (
            <div key={loopIdx} className="flex items-center gap-8 shrink-0">
              {items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div key={itemIdx} className="flex items-center gap-3 text-slate-950 font-black font-mono text-sm sm:text-base tracking-widest uppercase">
                    <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center text-emerald-400 shadow-md">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {item.text}
                    </span>
                    <span className="text-emerald-300 font-bold ml-4">•</span>
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
