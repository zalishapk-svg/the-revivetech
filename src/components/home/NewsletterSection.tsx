import React, { useState } from "react";
import { Mail, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const { showToast } = useShopify();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      showToast("VIP Access Granted! Coupon code REVIVE15 activated.");
      setEmail("");
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#030e07] to-[#010804] text-slate-100 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="bg-[#071910] border border-emerald-800/60 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6">
          <div className="w-12 h-12 bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto border border-emerald-800/40">
            <Zap className="w-6 h-6 fill-emerald-400" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Join The Revive Tech VIP Guild
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Get instant priority notifications on limited carbon fiber production drops, experimental firmware builds, and a <strong>$15 OFF welcome voucher</strong>.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your gamer email"
              className="flex-1 px-4 py-3 bg-slate-950 border border-emerald-800/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2"
            >
              <span>Join Guild</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Unsubscribe at any time with 1-click. Zero spam guarantee.
          </p>
        </div>

      </div>
    </section>
  );
};
