import React, { useState } from "react";
import { Mail, ShieldCheck, Globe, X } from "lucide-react";

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#1c1c1c] text-emerald-100 text-xs py-1.5 px-3 sm:px-4 border-b border-emerald-950/60 relative z-40">
      
      {/* DESKTOP TOP BAR */}
      <div className="hidden lg:flex max-w-7xl mx-auto items-center justify-between gap-4">
        {/* Left: Official Email Contact */}
        <div className="flex items-center gap-2.5">
          <a
            href="mailto:therevivetech@gmail.com"
            className="flex items-center gap-1.5 font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hover:underline">therevivetech@gmail.com</span>
          </a>
        </div>

        {/* Center/Right: Store Status & Close */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Authentic Products
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              PKR (Rs.)
            </span>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-emerald-400/60 hover:text-emerald-300 p-0.5 transition-colors cursor-pointer"
            aria-label="Close Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET TOP BAR (< lg screens) */}
      <div className="lg:hidden flex items-center justify-between overflow-hidden h-6 text-xs select-none">
        {/* Email Link */}
        <div className="flex items-center shrink-0">
          <a
            href="mailto:therevivetech@gmail.com"
            className="flex items-center gap-1.5 font-medium text-emerald-400 hover:text-emerald-300 transition-colors text-[11px]"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hover:underline">therevivetech@gmail.com</span>
          </a>
        </div>

        {/* Brand Tagline */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="hidden sm:inline">• 100% Authentic Hardware</span>
        </div>

        {/* CLOSE BUTTON FIXED ON RIGHT */}
        <button
          onClick={() => setIsVisible(false)}
          className="shrink-0 bg-[#1c1c1c] pl-1.5 z-10 text-emerald-400/60 hover:text-emerald-300 p-0.5 cursor-pointer"
          aria-label="Close Announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

