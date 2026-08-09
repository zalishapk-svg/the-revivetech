import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Tag, BookOpen, Layers, Sparkles } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, collections, articles, navigateToProduct, navigateToCollection, navigateToArticle } = useShopify();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchTerm("");
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const term = searchTerm.toLowerCase().trim();

  const matchingProducts = term
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.vendor.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term))
      )
    : products.slice(0, 4);

  const matchingCollections = term
    ? collections.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          (c.description && c.description.toLowerCase().includes(term))
      )
    : collections.slice(0, 3);

  const matchingArticles = term
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.content.toLowerCase().includes(term) ||
          a.tags?.some((t) => t.toLowerCase().includes(term))
      )
    : articles.slice(0, 2);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl bg-[#071910] border border-emerald-800/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-emerald-900/40 bg-emerald-950/40">
            <Search className="w-5 h-5 text-emerald-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, collections, or tech articles... (e.g. OLED, Mouse, 8000Hz)"
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block bg-slate-900 border border-emerald-800/60 text-[10px] text-slate-400 px-2 py-0.5 rounded font-mono">
              ESC
            </kbd>
          </div>

          {/* Search Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
            
            {/* Products Section */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Products ({matchingProducts.length})
                </span>
                {!term && <span className="text-[10px] text-slate-400 font-mono">Popular Items</span>}
              </div>

              {matchingProducts.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No products found matching "{searchTerm}"</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        navigateToProduct(product.handle);
                        setIsSearchOpen(false);
                      }}
                      className="flex items-center gap-3 p-2 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-900/30 hover:border-emerald-500/40 transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                        {product.featuredImage?.url ? (
                          <img
                            src={product.featuredImage.url}
                            alt={product.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-emerald-950 flex items-center justify-center text-xs">TRT</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-emerald-300">
                          {product.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] mt-0.5">
                          <span className="font-mono text-emerald-400 font-bold">
                            {formatMoney(product.priceRange.minVariantPrice.amount)}
                          </span>
                          <span className="text-slate-400">{product.vendor}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Collections Section */}
            {matchingCollections.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
                  <Layers className="w-3.5 h-3.5" /> Collections ({matchingCollections.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchingCollections.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        navigateToCollection(col.handle);
                        setIsSearchOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 text-xs font-medium text-slate-200 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                    >
                      <span>{col.title}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Articles Section */}
            {matchingArticles.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
                  <BookOpen className="w-3.5 h-3.5" /> Journal Articles ({matchingArticles.length})
                </div>
                <div className="space-y-2">
                  {matchingArticles.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => {
                        navigateToArticle(art.handle);
                        setIsSearchOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-900/20 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <h5 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                          {art.title}
                        </h5>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{art.excerpt}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-400 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="px-4 py-2.5 bg-slate-950 border-t border-emerald-900/40 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Powered by Shopify Storefront API</span>
            <span>Press <kbd className="font-mono text-emerald-400">ESC</kbd> to exit</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
