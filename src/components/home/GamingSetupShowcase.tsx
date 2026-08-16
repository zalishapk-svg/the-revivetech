import React, { useState } from "react";
import { Plus, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";

interface Hotspot {
  id: number;
  x: number; // percentage
  y: number; // percentage
  productHandle: string;
  label: string;
}

const HOTSPOTS: Hotspot[] = [
  { id: 1, x: 48, y: 35, productHandle: "revive-quantum-360-qd-oled-monitor", label: "Quantum 360Hz QD-OLED 4K Display" },
  { id: 2, x: 52, y: 72, productHandle: "revive-matrix-65-magnetic-keyboard", label: "Matrix 65% Rapid Trigger Keyboard" },
  { id: 3, x: 66, y: 74, productHandle: "revive-apex-pro-wireless-mouse", label: "Apex Pro 49g Wireless Mouse" },
  { id: 4, x: 28, y: 55, productHandle: "revive-planar-planar-planar-headset", label: "Planar Audio Wireless Headset" },
];

export const GamingSetupShowcase: React.FC = () => {
  const [activeHotspotId, setActiveHotspotId] = useState<number>(1);
  const { products, addToCart, navigateToProduct } = useShopify();

  const activeHotspot = HOTSPOTS.find((h) => h.id === activeHotspotId) || HOTSPOTS[0];
  const activeProduct = products.find((p) => p.handle === activeHotspot.productHandle) || products[activeHotspotId - 1] || products[0];

  if (!activeProduct) {
    return null;
  }

  return (
    <section className="py-16 bg-[#161616] border-b border-emerald-900/40 text-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> BATTLESTATION SHOWCASE
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Interactive Setup Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Click the pulse hotspots on the setup image below to inspect individual hardware components.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Setup Image with Interactive Hotspots */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-emerald-800/50 bg-[#161616] shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80"
              alt="Cyberpunk Gaming Battlestation Setup"
              referrerPolicy="no-referrer"
              className="w-full h-[450px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

            {/* Hotspot Pulse Dots */}
            {HOTSPOTS.map((spot) => {
              const isActive = spot.id === activeHotspotId;
              return (
                <button
                  key={spot.id}
                  onClick={() => setActiveHotspotId(spot.id)}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all z-20 ${
                    isActive ? "scale-125" : "hover:scale-110"
                  }`}
                  title={spot.label}
                >
                  <span className={`absolute -inset-2 rounded-full animate-ping opacity-75 ${
                    isActive ? "bg-amber-400" : "bg-emerald-400"
                  }`} />
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-lg transition-colors ${
                    isActive
                      ? "bg-amber-400 border-white text-slate-950 font-black shadow-amber-400/50"
                      : "bg-[#161616]/90 border-emerald-400 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950"
                  }`}>
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Product Preview Card */}
          <div className="lg:col-span-4 bg-[#1c1c1c] border border-emerald-800/50 rounded-3xl p-6 space-y-4 shadow-xl">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/30">
              HOTSPOT #{activeHotspot.id}: {activeHotspot.label}
            </span>

            <div className="relative rounded-2xl overflow-hidden bg-[#161616] border border-emerald-900/40 aspect-video">
              <img
                src={activeProduct.featuredImage?.url}
                alt={activeProduct.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                {activeProduct.vendor}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{activeProduct.title}</h3>
              <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                {activeProduct.description}
              </p>
            </div>

            <div className="pt-3 border-t border-emerald-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-mono">Storefront Price</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {formatMoney(activeProduct.priceRange.minVariantPrice.amount)}
                </span>
              </div>

              <button
                onClick={() => addToCart(activeProduct)}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
              >
                <ShoppingBag className="w-4 h-4" /> Add Gear
              </button>
            </div>

            <button
              onClick={() => navigateToProduct(activeProduct.handle)}
              className="w-full text-center text-xs font-bold text-emerald-400 hover:underline pt-1 block"
            >
              Full Specs & Benchmark Data →
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
