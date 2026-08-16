import React from "react";
import { motion } from "framer-motion";
import { Layers, Sparkles, Tag } from "lucide-react";
import { Collection } from "../../types";

interface CollectionHeroProps {
  collection: Collection;
  handle: string;
  totalProductsCount: number;
}

export const CollectionHero: React.FC<CollectionHeroProps> = ({
  collection,
  handle,
  totalProductsCount,
}) => {
  // Get image of the CURRENT collection only
  const imageUrl =
    collection.image?.url ||
    collection.products?.[0]?.featuredImage?.url ||
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-[#1c1c1c] via-[#222222] to-[#161616] border border-emerald-900/50 overflow-hidden shadow-2xl mb-8 min-h-[320px] md:min-h-[360px] flex flex-col md:flex-row items-stretch">
      {/* Ambient Background Glows */}
      <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-[#C0FE2D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-[#C0FE2D]/5 rounded-full blur-2xl pointer-events-none" />

      {/* LEFT CONTENT AREA */}
      <div className="relative z-20 w-full md:w-7/12 lg:w-3/5 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-3">
          <span className="bg-emerald-950/90 border border-emerald-800/70 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-inner">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Collection Catalog
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-mono text-[11px] truncate max-w-[180px]">
            /collections/{handle}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          {collection.title}
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mb-6">
          {collection.description ||
            `Browse our official ${collection.title} catalog featuring original high-performance gear, detailed specs, manufacturer warranty, and fast nationwide delivery across Pakistan.`}
        </p>

        {/* Collection Stats Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-emerald-900/40 text-xs font-mono">
          <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-emerald-900/60 text-slate-300 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <strong className="text-emerald-400 font-bold">{totalProductsCount}</strong> Available Products
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-emerald-900/60 text-slate-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            100% Genuine Warranty
          </span>
        </div>
      </div>

      {/* RIGHT IMAGE AREA WITH DIAGONAL COMPOSITION */}
      <div className="relative z-10 w-full md:w-5/12 lg:w-2/5 min-h-[240px] md:min-h-full overflow-hidden shrink-0 flex items-center justify-center">
        {/* Diagonal Container Mask for Desktop */}
        <div className="absolute inset-0 w-full h-full md:[clip-path:polygon(18%_0,_100%_0,_100%_100%,_0%_100%)] overflow-hidden bg-[#161616]">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full h-full min-h-[240px] md:min-h-full"
          >
            <img
              src={imageUrl}
              alt={collection.title}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-slate-950/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1c1c1c]/90 via-transparent to-transparent md:hidden" />
          </motion.div>

          {/* Current Collection Badge Overlaid on Bottom Left */}
          <div className="absolute bottom-4 left-4 z-20">
            <span className="bg-[#161616]/85 backdrop-blur-md border border-emerald-500/40 text-emerald-400 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold inline-flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {collection.title} Collection
            </span>
          </div>
        </div>

        {/* Glowing Diagonal Divider Line on Desktop */}
        <div className="hidden md:block absolute top-0 bottom-0 left-[18%] w-[2px] bg-gradient-to-b from-[#C0FE2D] via-[#9FD900]/80 to-transparent shadow-[0_0_15px_#C0FE2D] z-20 pointer-events-none transform -skew-x-[11deg] origin-top" />
      </div>
    </div>
  );
};
