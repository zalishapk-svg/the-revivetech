import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Layers, ShoppingBag, Check, Trash2 } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";

export const CompareDrawer: React.FC = () => {
  const { isCompareOpen, setIsCompareOpen, compareHandles, toggleCompare, products, addToCart } = useShopify();

  // Lock body scroll when compare drawer is open
  useEffect(() => {
    if (isCompareOpen && compareHandles.length > 0) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCompareOpen, compareHandles.length]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCompareOpen) {
        setIsCompareOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCompareOpen, setIsCompareOpen]);

  if (!isCompareOpen || compareHandles.length === 0) return null;

  const compareProducts = products.filter((p) => compareHandles.includes(p.handle));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCompareOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="relative w-full max-w-5xl bg-[#1c1c1c] border border-emerald-800/60 rounded-2xl p-5 shadow-2xl text-slate-100 z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">Compare Tech Specifications</h3>
              <span className="text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-mono border border-emerald-800">
                {compareProducts.length} / 4 Products Selected
              </span>
            </div>
            <button onClick={() => setIsCompareOpen(false)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-emerald-900/30">
                  <th className="p-2 text-slate-400 font-mono w-32">Feature</th>
                  {compareProducts.map((p) => (
                    <th key={p.id} className="p-3 min-w-[180px] align-top">
                      <div className="relative group">
                        <img src={p.featuredImage?.url} alt={p.title} className="w-20 h-20 rounded-lg object-cover bg-slate-900 mx-auto mb-2" />
                        <button
                          onClick={() => toggleCompare(p.handle)}
                          className="absolute top-0 right-0 p-1 bg-rose-950/80 text-rose-400 rounded-full hover:bg-rose-900"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <h4 className="font-bold text-white line-clamp-2 text-center text-xs mb-1">{p.title}</h4>
                      <p className="font-mono text-emerald-400 font-bold text-center text-xs mb-2">
                        {formatMoney(p.priceRange?.minVariantPrice?.amount || "0")}
                      </p>
                      <button
                        onClick={() => addToCart(p)}
                        className="w-full py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-[11px] hover:bg-emerald-400 flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" /> Add
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950">
                <tr>
                  <td className="p-2 font-semibold text-slate-400">Vendor</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center text-slate-200 font-medium">{p.vendor}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-400">Rating</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center text-amber-400 font-bold">★ {p.rating || 4.9} ({p.reviewsCount} reviews)</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-400">Key Specs</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-3 text-slate-300">
                      {p.specs ? (
                        <ul className="space-y-1 text-[11px]">
                          {Object.entries(p.specs).slice(0, 3).map(([k, v]) => (
                            <li key={k}><strong className="text-emerald-400">{k}:</strong> {v}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-500">Standard Specs</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
