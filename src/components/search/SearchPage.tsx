import React, { useState, useMemo } from "react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";
import { Search, ChevronRight, ShoppingBag, Star, Eye } from "lucide-react";

interface SearchPageProps {
  initialQuery?: string;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = "" }) => {
  const { products, articles, addToCart, navigateToProduct, setQuickViewHandle } = useShopify();
  const [query, setQuery] = useState(initialQuery);

  const matchedProducts = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [products, query]);

  const matchedArticles = useMemo(() => {
    if (!query.trim()) return articles;
    const q = query.toLowerCase();
    return articles.filter((a) => {
      return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
    });
  }, [articles, query]);

  return (
    <div className="w-full bg-[#030e07] text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ""; }} className="hover:text-emerald-400">
            Home
          </a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-emerald-400 font-semibold">Search Results</span>
        </nav>

        {/* Search Header */}
        <div className="bg-[#05140b] border border-emerald-900/40 rounded-3xl p-8 shadow-2xl space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Search Hardware & Knowledge Base</h1>
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, switch types, brands, or articles..."
              className="w-full bg-[#030e07] border border-emerald-900/60 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Found <strong className="text-emerald-400">{matchedProducts.length}</strong> Products and <strong className="text-emerald-400">{matchedArticles.length}</strong> Guides for "{query}"
          </p>
        </div>

        {/* Product Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Product Results</h2>
          {matchedProducts.length === 0 ? (
            <div className="bg-[#05140b] border border-emerald-900/40 rounded-2xl p-8 text-center text-xs text-slate-400">
              No products found matching "{query}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {matchedProducts.map((p) => {
                const minPrice = p.priceRange.minVariantPrice.amount;
                return (
                  <div
                    key={p.id}
                    className="bg-[#05140b] border border-emerald-900/40 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-300 flex flex-col"
                  >
                    <div 
                      onClick={() => navigateToProduct(p.handle)}
                      className="w-full h-40 bg-[#030e07] rounded-xl overflow-hidden mb-3 cursor-pointer p-2 flex items-center justify-center"
                    >
                      <img src={p.featuredImage?.url} alt={p.title} className="max-h-full object-contain" />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">{p.vendor}</span>
                    <h4 
                      onClick={() => navigateToProduct(p.handle)}
                      className="font-bold text-white text-xs hover:text-emerald-400 transition-colors line-clamp-2 cursor-pointer mb-2 flex-1"
                    >
                      {p.title}
                    </h4>
                    <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between mt-auto">
                      <span className="font-mono font-bold text-emerald-400 text-xs">{formatMoney(minPrice)}</span>
                      <button
                        onClick={() => addToCart(p)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2 rounded-xl"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
