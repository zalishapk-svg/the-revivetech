import React from "react";
import { Zap, ShieldCheck, Truck, Sparkles, Award, Headphones, ShieldAlert, Cpu } from "lucide-react";

interface PromotionalMarqueeProps {
  className?: string;
}

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.301-.776.978-.952 1.179-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.63-.927-2.232-.244-.587-.492-.507-.677-.516l-.577-.01c-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.379.197 1.9.12.58-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.201-.577-.351z" />
    <path d="M12.004 0C5.373 0 0 5.373 0 12c0 2.115.547 4.103 1.504 5.834L0 24l6.347-1.47A11.94 11.94 0 0 0 12.004 24C18.627 24 24 18.627 24 12S18.627 0 12.004 0zm0 21.93c-1.895 0-3.664-.537-5.176-1.465l-.371-.227-3.766.873.885-3.673-.245-.382a9.92 9.92 0 0 1-1.536-5.056C1.795 6.363 6.368 1.795 12.004 1.795c5.631 0 10.205 4.568 10.205 10.205 0 5.637-4.574 10.205-10.205 10.205z" />
  </svg>
);

export const PromotionalMarquee: React.FC<PromotionalMarqueeProps> = ({
  className = "",
}) => {
  const items = [
    { icon: Zap, text: "AUTHENTIC GAMING GEAR" },
    { icon: Truck, text: "EXPRESS NATIONWIDE SHIPPING" },
    { icon: ShieldCheck, text: "VERIFIED ORIGINAL HARDWARE" },
    { icon: Sparkles, text: "PREMIUM CUSTOMER SUPPORT" },
    { icon: Award, text: "OFFICIAL WARRANTY & SUPPORT" },
    { icon: Headphones, text: "EXPERT HARDWARE ADVICE" },
    { icon: Cpu, text: "LATEST ESPORTS TECH DROPS" },
  ];

  return (
    <div className={`my-6 relative overflow-hidden py-2 ${className}`}>
      {/* Background Glow Field */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(192,254,45,0.12)_0%,transparent_75%)] pointer-events-none" />

      {/* SINGLE MARQUEE HEADLINE */}
      <div className="w-[104%] -ml-[2%] bg-gradient-to-r from-[#161616] via-[#24330e] to-[#161616] border-y border-[#C0FE2D]/40 shadow-[0_4px_20px_rgba(192,254,45,0.2)] py-3 relative z-10 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee-left items-center gap-8">
          {[...Array(4)].map((_, loopIdx) => (
            <div key={`marquee-${loopIdx}`} className="flex items-center gap-8 shrink-0">
              {/* WhatsApp Announcement - Placed BEFORE existing items */}
              <a
                href="https://wa.me/923375799958"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 font-black font-mono text-xs sm:text-sm tracking-widest uppercase transition-all duration-200 cursor-pointer"
                title="Chat on WhatsApp: 03375799958"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white border border-[#25D366]/80 shadow-[0_0_8px_rgba(37,211,102,0.4)] group-hover:scale-110 transition-transform shrink-0">
                  <WhatsAppIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white fill-white" />
                </div>
                <span className="text-white group-hover:text-[#25D366] transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] flex items-center gap-1.5">
                  <span>EXPRESS NATIONWIDE SHIPPING — Please Re-Confirm the availability of Products:</span>
                  <span className="text-[#25D366] group-hover:underline font-extrabold tracking-wider">03375799958</span>
                </span>
                <span className="text-emerald-400 font-bold ml-4">•</span>
              </a>

              {items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div key={itemIdx} className="flex items-center gap-2.5 text-slate-950 font-black font-mono text-xs sm:text-sm tracking-widest uppercase">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#161616] flex items-center justify-center text-emerald-400 border border-emerald-500/40 shadow">
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
    </div>
  );
};

