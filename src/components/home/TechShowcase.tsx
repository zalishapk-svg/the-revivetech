import React from "react";
import { Cpu, ShieldCheck, Zap, Radio, Sparkles } from "lucide-react";

export const TechShowcase: React.FC = () => {
  return (
    <section className="py-20 bg-[#161616] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> PROPRIETARY HARDWARE ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Engineering Precision Without Compromise
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Every peripheral and display component is custom-crafted in our ISO-9001 certified labs using aerospace materials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-[#1c1c1c] border border-emerald-900/40 p-8 rounded-3xl space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-800/40">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">8000Hz HyperPolling</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transmits motion data 8 times faster than standard 1000Hz gaming mice, reducing input latency to a microscopic 0.125ms.
            </p>
          </div>

          <div className="bg-[#1c1c1c] border border-emerald-900/40 p-8 rounded-3xl space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-800/40">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Magnetic Hall-Effect</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Replaces physical copper switch Contacts with magnetic flux sensors. Rapid Trigger technology resets keys instantly on finger release.
            </p>
          </div>

          <div className="bg-[#1c1c1c] border border-emerald-900/40 p-8 rounded-3xl space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-800/40">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Vapor Chamber Cooling</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Custom graphite film and liquid copper vapor chambers draw heat away from QD-OLED subpixels without noisy active cooling fans.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
