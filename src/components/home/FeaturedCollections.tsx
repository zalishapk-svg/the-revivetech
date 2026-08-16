import React, { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { ProductCard } from "../common/ProductCard";

export const FeaturedCollections: React.FC = () => {
  const { collections, products, addToCart, navigateToProduct, navigateToCollection } = useShopify();
  const [activeTab, setActiveTab] = useState(collections[0]?.handle || "gaming-mice");

  const currentCollection = collections.find((c) => c.handle === activeTab) || collections[0];
  const filteredProducts = products.filter((p) => p.tags.includes(currentCollection?.title) || p.productType === currentCollection?.title || true).slice(0, 4);

  return (
    <section className="py-16 bg-[#161616] border-b border-emerald-900/40 text-slate-100">
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
        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>

      </div>
    </section>
  );
};
