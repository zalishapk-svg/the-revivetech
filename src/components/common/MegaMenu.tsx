import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Layers, Grid } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const { collections, navigateToCollection, navigateToCollectionsList, navigateToShop } = useShopify();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 top-20 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 w-full bg-[#05110a]/98 border-b border-emerald-900/50 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.95)] z-50 text-slate-100 max-h-[80vh] overflow-y-auto"
          >
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            {/* Header / Meta bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-900/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950 px-3 py-1 rounded border border-emerald-800/60 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  STORE COLLECTIONS ({collections.length})
                </span>
              </div>

              <button
                onClick={() => {
                  navigateToCollectionsList();
                  onClose();
                }}
                className="text-xs font-bold font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 hover:underline"
              >
                View Collections Directory ({collections.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dynamic Real Collections Grid */}
            {collections && collections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {collections.map((col) => {
                  const bgImage =
                    col.image?.url ||
                    col.products?.[0]?.featuredImage?.url ||
                    col.products?.[0]?.images?.[0]?.url;

                  return (
                    <button
                      key={col.id}
                      onClick={() => {
                        navigateToCollection(col.handle);
                        onClose();
                      }}
                      className="group p-3.5 rounded-2xl bg-slate-900/80 hover:bg-emerald-950/80 border border-emerald-900/40 hover:border-emerald-500/60 transition-all duration-200 text-left flex items-center gap-3.5 shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-emerald-900/50 relative group-hover:border-emerald-400 transition-colors">
                        {bgImage ? (
                          <img
                            src={bgImage}
                            alt={col.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-400 font-bold font-mono text-xs">
                            <Layers className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {col.title}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                          {col.products?.length || 0} Products
                        </p>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Loading live Shopify collections...
              </div>
            )}

            {/* Bottom Bar Action */}
            <div className="mt-6 pt-4 border-t border-emerald-900/40 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">
                Adding or removing collections in Shopify Admin updates this menu instantly.
              </span>
              <button
                onClick={() => {
                  navigateToShop();
                  onClose();
                }}
                className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <Grid className="w-3.5 h-3.5" /> Explore Full Store
              </button>
            </div>
          </div>
        </motion.div>
      </>
      )}
    </AnimatePresence>
  );
};
