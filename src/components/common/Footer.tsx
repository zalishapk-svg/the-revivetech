import React, { useState } from "react";
import { Zap, ShieldCheck, Truck, Headphones, RotateCcw, ArrowRight, Github, ExternalLink } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const Footer: React.FC = () => {
  const { 
    navigateToHome, navigateToShop, navigateToAbout, navigateToContact, 
    navigateToFAQ, navigateToPage, navigateToBlog, navigateToAccount, 
    collections, showToast 
  } = useShopify();
  const [emailInput, setEmailInput] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      showToast("Subscribed! Check your inbox for Rs. 1,500 OFF discount code REVIVE15");
      setEmailInput("");
    }
  };

  return (
    <footer className="bg-[#020503] border-t border-emerald-900/50 text-slate-300 pt-16 pb-12 relative overflow-hidden">
      
      {/* Background Accent Mesh */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-800/40 text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white uppercase">Express Shipping PK</h4>
              <p className="text-[11px] text-slate-400">Free over Rs. 15,000 tracked</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-800/40 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white uppercase">Authentic Products</h4>
              <p className="text-[11px] text-slate-400">100% Genuine Hardware</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-800/40 text-emerald-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white uppercase">7-Day Replacement</h4>
              <p className="text-[11px] text-slate-400">Instant hardware exchange</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-800/40 text-emerald-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white uppercase">24/7 Tech Support PK</h4>
              <p className="text-[11px] text-slate-400">Expert setup assistance</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-12 border-b border-emerald-900/40">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <button
              onClick={navigateToHome}
              className="flex items-center text-left focus:outline-none"
            >
              <img
                src="https://cdn.shopify.com/s/files/1/0610/4642/3631/files/Artboard_1_copy.png?v=1786431651"
                alt="The Revive Tech Logo"
                referrerPolicy="no-referrer"
                className="h-10 sm:h-12 w-auto max-w-[220px] object-contain"
              />
            </button>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              ThereReviveTech is Pakistan's leading gaming and hardware storefront built on an independent headless React architecture powered directly by Shopify Storefront API.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full border border-emerald-800/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Commerce Engine
              </span>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Catalog & Hardware</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={navigateToShop} className="hover:text-emerald-400 transition-colors">
                  Full Product Catalog
                </button>
              </li>
              {collections.slice(0, 4).map((col) => (
                <li key={col.id}>
                  <button
                    onClick={navigateToShop}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {col.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Support */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={navigateToHome} className="hover:text-emerald-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={navigateToAbout} className="hover:text-emerald-400 transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={navigateToContact} className="hover:text-emerald-400 transition-colors">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={navigateToFAQ} className="hover:text-emerald-400 transition-colors">
                  FAQ Knowledge Base
                </button>
              </li>
              <li>
                <button onClick={navigateToBlog} className="hover:text-emerald-400 transition-colors">
                  Blogs
                </button>
              </li>
              <li>
                <button onClick={navigateToAccount} className="hover:text-emerald-400 transition-colors">
                  Customer Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Stay Connected</h4>
            <p className="text-xs text-slate-400">
              Subscribe for exclusive hardware drops, early access, and a Rs. 1,500 discount coupon.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-800/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="space-y-1 text-center sm:text-left">
            <p>© 2026 Beta Tech Solutions. All rights reserved.</p>
            <p className="text-[11px] text-slate-400 font-medium">Powered by Beta Tech Solutions®</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => navigateToPage("privacy-policy")} className="hover:text-slate-300">
              Privacy Policy
            </button>
            <button onClick={() => navigateToPage("terms-and-conditions")} className="hover:text-slate-300">
              Terms & Conditions
            </button>
            <button onClick={() => navigateToPage("refund-policy")} className="hover:text-slate-300">
              Refund Policy
            </button>
            <button onClick={() => navigateToPage("shipping-policy")} className="hover:text-slate-300">
              Shipping Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
