import React, { useState } from "react";
import { Plus, Check, ShoppingBag, Zap } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";
import { ProductCarousel } from "../common/ProductCarousel";

export const FrequentlyBoughtTogether: React.FC = () => {
  const { products, isLoadingData, addToCart, showToast } = useShopify();

  // Pick 3 bundle items dynamically
  const item1 = products[0];
  const item2 = products[1] || products[0];
  const item3 = products[2] || products[0];

  const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({
    0: true,
    1: true,
    2: true,
  });

  if (isLoadingData) {
    return (
      <section className="py-14 bg-slate-950/80 border-b border-emerald-900/30 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <ProductCarousel
            title="Complementary Hardware Upgrades"
            subtitle="Top recommended companion accessories frequently paired together."
            badgeText="MATCHING GEAR"
            products={[]}
            isLoading={true}
          />
        </div>
      </section>
    );
  }

  if (!item1 || !item2 || !item3) return null;

  const bundleList = [item1, item2, item3];

  const toggleItem = (idx: number) => {
    setSelectedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Formula:
  // bundleTotal = sum of selected product prices
  // discount = bundleTotal * 0.10
  // finalPrice = bundleTotal - discount
  let bundleTotal = 0;
  bundleList.forEach((item, idx) => {
    if (selectedItems[idx]) {
      bundleTotal += parseFloat(item.priceRange?.minVariantPrice?.amount || "0");
    }
  });

  const discountAmount = bundleTotal * 0.10; // 10% bundle discount
  const finalPrice = bundleTotal - discountAmount;

  const handleAddBundle = () => {
    let addedCount = 0;
    bundleList.forEach((item, idx) => {
      if (selectedItems[idx]) {
        addToCart(item);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      showToast(`Added ${addedCount} items to cart with 10% Bundle Savings (${formatMoney(discountAmount)})!`);
    }
  };

  return (
    <section className="py-14 bg-slate-950/80 border-b border-emerald-900/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Bundle Calculator Card */}
        <div className="bg-slate-900 border border-emerald-800/50 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/40 pb-6">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800/40 inline-flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 fill-emerald-400" /> INSTANT SAVINGS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Frequently Bought Together
              </h2>
            </div>
            <div className="bg-emerald-500 text-slate-950 text-xs font-black font-mono px-3 py-1 rounded-full uppercase tracking-widest w-fit shadow-md">
              10% BUNDLE DISCOUNT
            </div>
          </div>

          {/* Bundle Items Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Items Grid */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row items-center gap-4">
              {bundleList.map((item, idx) => {
                const isSelected = !!selectedItems[idx];
                const itemPrice = parseFloat(item.priceRange?.minVariantPrice?.amount || "0");
                return (
                  <React.Fragment key={item.id}>
                    {idx > 0 && <Plus className="w-5 h-5 text-emerald-500 shrink-0 hidden sm:block" />}
                    <div
                      onClick={() => toggleItem(idx)}
                      className={`flex-1 w-full p-4 rounded-2xl border transition-all cursor-pointer text-center relative ${
                        isSelected
                          ? "bg-emerald-950/60 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : "bg-slate-950/50 border-slate-800 opacity-50 hover:opacity-80"
                      }`}
                    >
                      <div className="w-20 h-20 bg-slate-950 rounded-xl overflow-hidden mx-auto mb-3">
                        <img
                          src={item.featuredImage?.url || item.images?.[0]?.url}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xs font-bold text-white line-clamp-2 min-h-[32px]">
                        {item.title}
                      </h3>
                      <span className="font-mono text-xs font-bold text-emerald-400 block mt-2">
                        {formatMoney(itemPrice)}
                      </span>

                      <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-300">
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                            isSelected ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-600"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{isSelected ? "Included" : "Add to Bundle"}</span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Total Savings & Add Bundle Action */}
            <div className="lg:col-span-4 bg-slate-950 p-6 rounded-2xl border border-emerald-900/50 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-mono uppercase block">Bundle Subtotal</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                    {formatMoney(finalPrice)}
                  </span>
                  {discountAmount > 0 && (
                    <span className="text-sm text-slate-500 line-through font-mono">
                      {formatMoney(bundleTotal)}
                    </span>
                  )}
                </div>

                {discountAmount > 0 ? (
                  <div className="mt-2 bg-emerald-950 border border-emerald-800/60 p-2.5 rounded-lg text-emerald-400 text-xs font-mono font-bold">
                    Save {formatMoney(discountAmount)} with 10% Bundle Savings
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">Select items above to activate 10% savings.</p>
                )}
              </div>

              <button
                onClick={handleAddBundle}
                disabled={bundleTotal === 0}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider font-mono transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add Bundle to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Complementary Products Carousel */}
        <ProductCarousel
          title="Complementary Hardware Upgrades"
          subtitle="Top recommended companion accessories frequently paired together."
          badgeText="MATCHING GEAR"
          products={products.slice(3, 12)}
        />
      </div>
    </section>
  );
};
