import React, { useState } from "react";
import { Plus, Check, ShoppingBag, Zap } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";

export const FrequentlyBoughtTogether: React.FC = () => {
  const { products, addToCart, showToast } = useShopify();

  // Pick 3 bundle items
  const item1 = products[0]; // Mouse
  const item2 = products[1]; // Keyboard
  const item3 = products[4]; // Headset

  const [selectedItems, setSelectedItems] = useState({ 1: true, 2: true, 3: true });

  const toggleItem = (num: 1 | 2 | 3) => {
    setSelectedItems((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const totalPrice =
    (selectedItems[1] ? parseFloat(item1.priceRange.minVariantPrice.amount) : 0) +
    (selectedItems[2] ? parseFloat(item2.priceRange.minVariantPrice.amount) : 0) +
    (selectedItems[3] ? parseFloat(item3.priceRange.minVariantPrice.amount) : 0);

  const bundleDiscount = totalPrice * 0.15; // 15% bundle savings
  const finalBundleTotal = totalPrice - bundleDiscount;

  const handleAddBundle = () => {
    if (selectedItems[1]) addToCart(item1);
    if (selectedItems[2]) addToCart(item2);
    if (selectedItems[3]) addToCart(item3);
    showToast("Added Esports Champion Bundle to Cart (15% OFF Savings applied)!");
  };

  return (
    <section className="py-16 bg-[#05140b] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-[#071910] border border-emerald-800/50 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/40 pb-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-emerald-400" /> BUNDLE & SAVE 15%
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Frequently Bought Together
              </h2>
            </div>
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit">
              15% BUNDLE DISCOUNT
            </span>
          </div>

          {/* Bundle Items Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-8 flex flex-col sm:flex-row items-center gap-4">
              
              {/* Item 1 */}
              <div
                onClick={() => toggleItem(1)}
                className={`flex-1 p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                  selectedItems[1] ? "bg-emerald-950/60 border-emerald-500" : "bg-slate-950/40 border-emerald-900/20 opacity-50"
                }`}
              >
                <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden mx-auto mb-2">
                  <img src={item1.featuredImage?.url} alt={item1.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{item1.title}</h4>
                <span className="font-mono text-xs font-bold text-emerald-400 block mt-1">
                  {formatMoney(item1.priceRange.minVariantPrice.amount)}
                </span>
              </div>

              <Plus className="w-5 h-5 text-emerald-500 shrink-0" />

              {/* Item 2 */}
              <div
                onClick={() => toggleItem(2)}
                className={`flex-1 p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                  selectedItems[2] ? "bg-emerald-950/60 border-emerald-500" : "bg-slate-950/40 border-emerald-900/20 opacity-50"
                }`}
              >
                <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden mx-auto mb-2">
                  <img src={item2.featuredImage?.url} alt={item2.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{item2.title}</h4>
                <span className="font-mono text-xs font-bold text-emerald-400 block mt-1">
                  {formatMoney(item2.priceRange.minVariantPrice.amount)}
                </span>
              </div>

              <Plus className="w-5 h-5 text-emerald-500 shrink-0" />

              {/* Item 3 */}
              <div
                onClick={() => toggleItem(3)}
                className={`flex-1 p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                  selectedItems[3] ? "bg-emerald-950/60 border-emerald-500" : "bg-slate-950/40 border-emerald-900/20 opacity-50"
                }`}
              >
                <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden mx-auto mb-2">
                  <img src={item3.featuredImage?.url} alt={item3.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{item3.title}</h4>
                <span className="font-mono text-xs font-bold text-emerald-400 block mt-1">
                  {formatMoney(item3.priceRange.minVariantPrice.amount)}
                </span>
              </div>

            </div>

            {/* Bundle Checkout Box */}
            <div className="md:col-span-4 bg-slate-950 p-6 rounded-2xl border border-emerald-800/40 text-center space-y-4">
              <div>
                <span className="text-xs text-slate-400 block">Total Bundle Value</span>
                <span className="text-2xl font-black text-emerald-400 font-mono block">
                  {formatMoney(finalBundleTotal)}
                </span>
                {bundleDiscount > 0 && (
                  <span className="text-xs text-rose-400 font-bold block mt-0.5">
                    Save -${bundleDiscount.toFixed(2)} with 15% Bundle Savings!
                  </span>
                )}
              </div>

              <button
                onClick={handleAddBundle}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add Complete Bundle
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
