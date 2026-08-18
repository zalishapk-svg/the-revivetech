import React, { useState } from "react";
import { ShieldCheck, Truck, Headphones, RotateCcw, ArrowRight, MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

// Simple custom TikTok SVG icon
const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .56.04.82.11V9.3a6.33 6.33 0 00-1-.08A6.34 6.34 0 003 15.57a6.34 6.34 0 0010.86 4.48v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-3.04-1.18z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { 
    navigateToHome, navigateToShop, navigateToAbout, navigateToContact, 
    navigateToFAQ, navigateToPage, navigateToBlog, navigateToAccount, 
    navigateToTrackOrder, collections, showToast 
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
    <footer className="bg-[#161616] border-t border-emerald-900/50 text-slate-300 pt-16 pb-12 relative overflow-hidden">
      
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
              TheReviveTech is Pakistan's premier online store for authentic PC hardware, gaming peripherals, mechanical keyboards, and tech gear. Delivering genuine products nationwide with full warranty support.
            </p>
            
            {/* Social Media Links */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.tiktok.com/@revivetec"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-emerald-950/80 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-xl border border-emerald-800/40 transition-all"
                aria-label="TikTok"
                title="Follow us on TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/therevivetech/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-emerald-950/80 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-xl border border-emerald-800/40 transition-all"
                aria-label="Instagram"
                title="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/therevivetech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-emerald-950/80 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-xl border border-emerald-800/40 transition-all"
                aria-label="Facebook"
                title="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Hardware & Shop</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateToTrackOrder()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-700/60 text-[#C0FE2D] font-bold text-xs hover:bg-emerald-900 transition-all shadow-sm group text-left cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-[#C0FE2D] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Track Your Order</span>
                </button>
              </li>
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

          {/* Contact Information */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Contact Us</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Commercial Market, 96-D, Block D, DHA EME Sector, Lahore
                </span>
              </li>
              <li>
                <a
                  href="tel:03475799958"
                  className="flex items-center gap-2.5 text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>0347 5799958</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:therevivetech@gmail.com"
                  className="flex items-center gap-2.5 text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>therevivetech@gmail.com</span>
                </a>
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
                  className="w-full px-3 py-2 bg-[#222222] border border-emerald-800/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
            <p>© 2026 TheReviveTech. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] flex-wrap justify-center sm:justify-end">
            <button onClick={() => navigateToTrackOrder()} className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              <Truck className="w-3 h-3" />
              <span>Track Order</span>
            </button>
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
