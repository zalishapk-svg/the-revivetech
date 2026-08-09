import React, { useState } from "react";
import { ArrowRight, ShoppingBag, Star, Zap } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";

export const FeaturedCollections: React.FC = () => {
  const { collections, products, addToCart, navigateToProduct, navigateToCollection } = useShopify();
  const [activeTab, setActiveTab] = useState(collections[0]?.handle || "gaming-mice");

  const currentCollection = collections.find((c) => c.handle === activeTab) || collections[0];
  const filteredProducts = products.filter((p) => p.tags.includes(currentCollection?.title) || p.productType === currentCollection?.title || true).slice(0, 4);

  return (
    <section className="py-16 bg-[#030e07] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              COLLECTION HIGHLIGHTS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Featured Gear Collections
            </h2>
          </div>

          {/* Collection Tabs */}
          <div className="flex flex-wrap gap-2">
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => setActiveTab(col.handle)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  activeTab === col.handle
                    ? "bg-emerald-500 text-slate-950 border-emerald-400"
                    : "bg-emerald-950/40 text-slate-300 border-emerald-900/40 hover:border-emerald-500/40"
                }`}
              >
                {col.title}
              </button>
            ))}
          </div>
        </div>

        {/* Collection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-[#071910] rounded-2xl overflow-hidden border border-emerald-900/40 hover:border-emerald-500/50 transition-all p-4 flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => navigateToProduct(product.handle)}
                  className="cursor-pointer aspect-square bg-slate-900 rounded-xl overflow-hidden mb-3 relative"
                >
                  <img
                    src={product.featuredImage?.url}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{product.vendor}</span>
                <h4
                  onClick={() => navigateToProduct(product.handle)}
                  className="text-xs font-bold text-white hover:text-emerald-300 transition-colors line-clamp-1 cursor-pointer mt-0.5"
                >
                  {product.title}
                </h4>
              </div>

              <div className="pt-3 mt-3 border-t border-emerald-900/30 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {formatMoney(product.priceRange.minVariantPrice.amount)}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
