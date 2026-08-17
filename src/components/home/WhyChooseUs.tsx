import React from "react";
import { Truck, ShieldCheck, Headphones, RotateCcw } from "lucide-react";

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-16 bg-[#161616] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Why Choose TheReviveTech</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Industry-leading warranties, zero-risk returns, and direct official brand support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#1c1c1c] border border-emerald-900/40 p-6 rounded-2xl text-center space-y-3">
            <Truck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-sm text-white uppercase">Express Delivery</h3>
            <p className="text-xs text-slate-400">Fast & tracked nationwide shipping across Pakistan.</p>
          </div>

          <div className="bg-[#1c1c1c] border border-emerald-900/40 p-6 rounded-2xl text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-sm text-white uppercase">100% Authentic Products</h3>
            <p className="text-xs text-slate-400">Guaranteed original hardware directly sourced from authorized brand channels.</p>
          </div>

          <div className="bg-[#1c1c1c] border border-emerald-900/40 p-6 rounded-2xl text-center space-y-3">
            <RotateCcw className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-sm text-white uppercase">30-Day Money Back</h3>
            <p className="text-xs text-slate-400">Try your gear risk-free with zero restocking fees or hassle.</p>
          </div>

          <div className="bg-[#1c1c1c] border border-emerald-900/40 p-6 rounded-2xl text-center space-y-3">
            <Headphones className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-sm text-white uppercase">24/7 Gamer Support</h3>
            <p className="text-xs text-slate-400">Live chat assistance for firmware updates & tuning.</p>
          </div>
        </div>

      </div>
    </section>
  );
};
