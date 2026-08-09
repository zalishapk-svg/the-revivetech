import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Search, ShoppingBag, Heart, User, Zap, Globe } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const {
    navigateToHome,
    navigateToCollection,
    navigateToCollectionsList,
    navigateToBlog,
    navigateToAccount,
    setIsSearchOpen,
    setIsCartOpen,
    cartCount,
    wishlistHandles,
    collections,
  } = useShopify();

  const [openSection, setOpenSection] = useState<string | null>("collections");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#05140b] border-l border-emerald-900/40 text-slate-100 p-6 flex flex-col justify-between overflow-y-auto"
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-emerald-900/40">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span className="font-mono font-bold tracking-wider text-white">THEREVIVETECH</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 gap-2 my-6">
              <button
                onClick={() => {
                  onClose();
                  setIsSearchOpen(true);
                }}
                className="flex items-center justify-center gap-2 py-2.5 bg-emerald-950/60 border border-emerald-800/40 rounded-xl text-xs font-semibold text-emerald-300"
              >
                <Search className="w-4 h-4" /> Search Store
              </button>
              <button
                onClick={() => {
                  onClose();
                  setIsCartOpen(true);
                }}
                className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
              >
                <ShoppingBag className="w-4 h-4" /> Cart ({cartCount})
              </button>
            </div>

            {/* Navigation Links */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  navigateToHome();
                  onClose();
                }}
                className="w-full text-left py-2 font-bold text-base border-b border-emerald-950 hover:text-emerald-400"
              >
                Home
              </button>

              {/* Collections Accordion */}
              <div className="border-b border-emerald-950 py-2">
                <button
                  onClick={() => setOpenSection(openSection === "collections" ? null : "collections")}
                  className="w-full flex items-center justify-between font-bold text-base text-left hover:text-emerald-400"
                >
                  <span>Shop Collections</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "collections" ? "rotate-180 text-emerald-400" : ""}`} />
                </button>

                {openSection === "collections" && (
                  <div className="mt-3 pl-3 space-y-2.5 border-l border-emerald-800/40">
                    <button
                      onClick={() => {
                        navigateToCollectionsList();
                        onClose();
                      }}
                      className="block text-xs font-bold text-emerald-400 hover:underline"
                    >
                      → View All Collections ({collections.length})
                    </button>
                    {collections.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => {
                          navigateToCollection(col.handle);
                          onClose();
                        }}
                        className="block text-xs text-slate-300 hover:text-white"
                      >
                        {col.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  navigateToBlog();
                  onClose();
                }}
                className="w-full text-left py-2 font-bold text-base border-b border-emerald-950 hover:text-emerald-400"
              >
                Tech Journal & Articles
              </button>

              <button
                onClick={() => {
                  navigateToAccount();
                  onClose();
                }}
                className="w-full text-left py-2 font-bold text-base border-b border-emerald-950 hover:text-emerald-400 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-emerald-400" /> Customer Account
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-6 border-t border-emerald-900/40 space-y-2 text-xs text-slate-400">
            <p className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" /> Currency: PKR (Rs.)
            </p>
            <p className="text-[11px] font-mono text-emerald-500/80">
              TheReviveTech Headless Shopify Storefront
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
