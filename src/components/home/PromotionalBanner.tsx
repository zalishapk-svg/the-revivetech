import React from "react";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { YellowTape } from "../common/YellowTape";

export const PromotionalBanner: React.FC = () => {
  const { navigateToProduct, navigateToShop, products } = useShopify();

  return (
    <section className="py-20 bg-[#161616] border-b border-emerald-900/40 text-slate-100 relative overflow-hidden">
      
      {/* Background Accent Lines */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#1c1c1c] border border-emerald-800/50 rounded-3xl p-8 sm:p-12 shadow-2xl">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 fill-slate-950" /> EDITORIAL FEATURE
            </span>

            {/* RULE 14: Selective Yellow Tape Highlight Treatment */}
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight text-white">
              ENGINEERED TO REVOLUTIONIZE YOUR <YellowTape>BATTLESTATION</YellowTape>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Experience zero audio compression with 90mm Swiss-engineered Planar Magnetic drivers. Simultaneous 2.4GHz High-Res wireless + Bluetooth 5.3 multi-point connectivity with 80 hours continuous battery runtime.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => products.length > 0 ? navigateToProduct(products[0].handle) : navigateToShop()}
                className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 shadow-xl shadow-emerald-950/60"
              >
                <span>Experience Planar Audio ($329.99)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <ShieldCheck className="w-4 h-4" /> Official Brand Warranty Included
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-emerald-800/40 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
                alt="Planar Magnetic Headset"
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
