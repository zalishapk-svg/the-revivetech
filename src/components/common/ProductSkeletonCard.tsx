import React from "react";

export const ProductSkeletonCard: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-[#1c1c1c] border border-emerald-900/30 p-4 shadow-md animate-pulse flex flex-col h-full">
      {/* Aspect Ratio Image Box */}
      <div className="w-full aspect-square rounded-xl bg-emerald-950/40 border border-emerald-900/20 mb-4 relative overflow-hidden flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-emerald-900/30 border border-emerald-800/30" />
      </div>

      {/* Vendor / Badge */}
      <div className="w-20 h-3 rounded bg-emerald-950/80 border border-emerald-900/30 mb-2.5" />

      {/* Title Lines */}
      <div className="w-full h-4 rounded bg-slate-800/80 mb-2" />
      <div className="w-2/3 h-4 rounded bg-slate-800/60 mb-4" />

      {/* Price Line */}
      <div className="mt-auto pt-3 border-t border-emerald-900/20 flex items-center justify-between">
        <div className="w-24 h-5 rounded bg-emerald-900/50" />
        <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-900/40" />
      </div>

      {/* Action Button */}
      <div className="w-full h-9 rounded-xl bg-emerald-950/60 border border-emerald-900/30 mt-3" />
    </div>
  );
};
