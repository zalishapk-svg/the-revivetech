import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Layers } from "lucide-react";
import { Collection } from "../../types";
import { YellowTape } from "../common/YellowTape";

interface ShopHeroProps {
  isSale?: boolean;
  isExplore?: boolean;
  itemCount: number;
  totalProductsCount: number;
  collections: Collection[];
  onNavigateToCollection: (handle: string) => void;
}

export const ShopHero: React.FC<ShopHeroProps> = ({
  isSale = false,
  isExplore = false,
  itemCount,
  totalProductsCount,
  collections,
  onNavigateToCollection,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter collections that actually have an image or product image
  const validCollections = collections.filter(
    (c) => c.image?.url || c.products?.[0]?.featuredImage?.url
  );

  const displayCollections = validCollections.length > 0 ? validCollections : collections;

  // Auto-rotate through Shopify collections every 4 seconds
  useEffect(() => {
    if (displayCollections.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayCollections.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [displayCollections.length]);

  const activeCol = displayCollections[currentIndex];
  const activeImageUrl =
    activeCol?.image?.url ||
    activeCol?.products?.[0]?.featuredImage?.url ||
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-[#04150b] via-[#072413] to-[#020b05] border border-emerald-900/50 overflow-hidden shadow-2xl mb-8 min-h-[320px] md:min-h-[360px] flex flex-col md:flex-row items-stretch">
      {/* Background Ambient Glows */}
      <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />

      {/* LEFT CONTENT AREA */}
      <div className="relative z-20 w-full md:w-7/12 lg:w-3/5 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
        <div className="mb-3">
          <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest bg-emerald-950/90 px-3.5 py-1.5 rounded-full border border-emerald-800/70 inline-flex items-center gap-2 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {isSale ? (
              `Shopify Sale & Discounted Hardware`
            ) : isExplore ? (
              `Complete Store Catalog`
            ) : (
              "Official Hardware Store"
            )}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          {isSale ? (
            <>
              On Sale <YellowTape text="DISCOUNTED GEAR" />
            </>
          ) : isExplore ? (
            <>
              Explore All <YellowTape text="STORE PRODUCTS" />
            </>
          ) : (
            <>
              Explore <YellowTape text="THE REVIVE TECH SHOP" />
            </>
          )}
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
          {isSale ? (
            `Showing ONLY live discounted products directly from our Shopify store inventory with active compare-at prices. Deals update automatically.`
          ) : isExplore ? (
            `Viewing our complete Shopify store catalog (${totalProductsCount} products total). Every single item in our store is accessible below with full category filters, search, sorting, and pagination.`
          ) : (
            `Browse our full collection of genuine gaming mice, custom mechanical keyboards, audiophile headsets, high-refresh displays, and battlestation accessories with official Pakistan warranty.`
          )}
        </p>
      </div>

      {/* RIGHT IMAGE AREA WITH DIAGONAL COMPOSITION */}
      <div className="relative z-10 w-full md:w-5/12 lg:w-2/5 min-h-[240px] md:min-h-full overflow-hidden shrink-0 flex items-center justify-center">
        {/* Diagonal Container Mask for Desktop */}
        <div className="absolute inset-0 w-full h-full md:[clip-path:polygon(18%_0,_100%_0,_100%_100%,_0%_100%)] overflow-hidden bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCol?.id || currentIndex}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="relative w-full h-full min-h-[240px] md:min-h-full"
            >
              <img
                src={activeImageUrl}
                alt={activeCol?.title || "Shopify Collection"}
                className="w-full h-full object-cover object-center"
              />

              {/* Gradient Dark Overlay for Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020b05] via-slate-950/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#04150b]/90 via-transparent to-transparent md:hidden" />
            </motion.div>
          </AnimatePresence>

          {/* Clean Clickable Collection Name Badge Only */}
          {activeCol && (
            <div className="absolute bottom-4 left-4 z-20">
              <button
                onClick={() => onNavigateToCollection(activeCol.handle)}
                className="bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wide transition-all shadow-xl cursor-pointer"
              >
                {activeCol.title}
              </button>
            </div>
          )}
        </div>

        {/* Glowing Diagonal Divider Line on Desktop */}
        <div className="hidden md:block absolute top-0 bottom-0 left-[18%] w-[2px] bg-gradient-to-b from-emerald-400 via-emerald-500/80 to-transparent shadow-[0_0_15px_#10b981] z-20 pointer-events-none transform -skew-x-[11deg] origin-top" />
      </div>
    </div>
  );
};
