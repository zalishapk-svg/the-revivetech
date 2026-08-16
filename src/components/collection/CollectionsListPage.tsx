import React from "react";
import { Grid, ArrowRight, Layers, Tag } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const CollectionsListPage: React.FC = () => {
  const { 
    collections, navigateToCollection, products,
    hasMoreCollections, isFetchingMoreCollections, fetchAllCollections
  } = useShopify();

  React.useEffect(() => {
    if (hasMoreCollections && !isFetchingMoreCollections) {
      fetchAllCollections();
    }
  }, [hasMoreCollections, isFetchingMoreCollections]);

  return (
    <div className="bg-[#161616] text-slate-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Banner Header */}
        <div className="bg-[#1c1c1c] border border-emerald-800/50 p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <Grid className="w-4 h-4" /> OFFICIAL HARDWARE COLLECTIONS
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white">Browse Collections</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Explore curated gaming hardware collections directly sourced from verified manufacturers for maximum performance and reliability across Pakistan.
            </p>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((col) => {
            const itemCount = col.products?.length || col.productsCount || 0;
            const bgImage = col.image?.url || col.products?.[0]?.featuredImage?.url;

            return (
              <div
                key={col.id}
                onClick={() => navigateToCollection(col.handle)}
                className="group cursor-pointer bg-[#1c1c1c] border border-emerald-900/40 hover:border-emerald-500/50 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-emerald-950/50"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  {bgImage ? (
                    <img
                      src={bgImage}
                      alt={col.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-emerald-500/30">
                      <Layers className="w-16 h-16" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] via-transparent to-transparent opacity-80" />
                  <span className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs px-3 py-1 rounded-full font-bold backdrop-blur-md">
                    {itemCount} {itemCount === 1 ? "Item" : "Items"}
                  </span>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                      <span>{col.title}</span>
                      <ArrowRight className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                    {col.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {col.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-emerald-900/40 flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
                    <span>Explore Hardware</span>
                    <span className="text-slate-500">/collections/{col.handle}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
