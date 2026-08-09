import React from "react";

export const AnimatedStatistics: React.FC = () => {
  return (
    <section className="py-16 bg-[#030e07] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6 bg-[#071910] rounded-2xl border border-emerald-900/40">
            <span className="font-mono text-3xl sm:text-5xl font-black text-emerald-400 block">50,000+</span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1 block">Happy Gamers</span>
          </div>

          <div className="p-6 bg-[#071910] rounded-2xl border border-emerald-900/40">
            <span className="font-mono text-3xl sm:text-5xl font-black text-emerald-400 block">99.8%</span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1 block">On-Time Delivery</span>
          </div>

          <div className="p-6 bg-[#071910] rounded-2xl border border-emerald-900/40">
            <span className="font-mono text-3xl sm:text-5xl font-black text-amber-400 block">4.9 ★</span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1 block">Average Rating</span>
          </div>

          <div className="p-6 bg-[#071910] rounded-2xl border border-emerald-900/40">
            <span className="font-mono text-3xl sm:text-5xl font-black text-emerald-400 block">&lt; 24h</span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1 block">Dispatch Guarantee</span>
          </div>
        </div>

      </div>
    </section>
  );
};
