import React from "react";
import { Star, CheckCircle, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Marcus K.",
    role: "Valorant Pro Player",
    comment: "The 49g carbon fiber Apex Pro mouse feels frictionless. My flick consistency improved immediately after switching.",
    rating: 5,
    product: "Apex Pro Wireless Mouse",
  },
  {
    name: "Siddharth P.",
    role: "Hardware Streamer",
    comment: "360Hz on 4K QD-OLED is unbelievable. Infinite black levels and the vapor chamber cooling keeps it silent.",
    rating: 5,
    product: "Quantum 360Hz QD-OLED",
  },
  {
    name: "Elena Rostova",
    role: "Software Architect & CS2 Player",
    comment: "Rapid Trigger magnetic switches are a game changer. Counter-strafing feels effortless and crisp.",
    rating: 5,
    product: "Matrix 65% Magnetic Keyboard",
  },
];

export const CustomerReviews: React.FC = () => {
  return (
    <section className="py-16 bg-[#05140b] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
            VERIFIED BUYER FEEDBACK
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Endorsed by Competitive Gamers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="bg-[#071910] border border-emerald-900/40 p-6 rounded-2xl space-y-4 relative"
            >
              <Quote className="w-8 h-8 text-emerald-500/20 absolute top-4 right-4" />
              <div className="flex text-amber-400">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">"{rev.comment}"</p>
              <div className="pt-3 border-t border-emerald-900/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    {rev.name} <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                  </h4>
                  <span className="text-[10px] text-slate-400">{rev.role}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {rev.product}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
