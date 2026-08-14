import React, { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  Search,
  ShoppingBag,
  User,
  Globe,
  HelpCircle,
  PhoneCall,
  Info,
} from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const MobileNav: React.FC = () => {
  const {
    isMobileNavOpen,
    setIsMobileNavOpen,
    navigateToHome,
    navigateToShop,
    navigateToSale,
    navigateToCollection,
    navigateToCollectionsList,
    navigateToBlog,
    navigateToAccount,
    navigateToAbout,
    navigateToContact,
    navigateToFAQ,
    setIsSearchOpen,
    setIsCartOpen,
    cartCount,
    collections,
  } = useShopify();

  const [openSection, setOpenSection] = useState<string | null>(null);

  const onClose = () => setIsMobileNavOpen(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[90] bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity duration-300 ease-in-out ${
          isMobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* OFF-CANVAS DRAWER */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[100] lg:hidden w-[85vw] max-w-[380px] sm:w-[380px] bg-[#04120a] border-l border-emerald-900/50 text-slate-100 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileNavOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          height: "100dvh",
        }}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-emerald-900/40">
            <img
              src="https://cdn.shopify.com/s/files/1/0610/4642/3631/files/Artboard_1_copy.png?v=1786431651"
              alt="The Revive Tech Logo"
              referrerPolicy="no-referrer"
              className="h-8 w-auto max-w-[170px] object-contain"
            />
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-emerald-950/80 hover:bg-emerald-900/80 rounded-xl border border-emerald-800/40 transition-colors"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5 text-emerald-400" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 gap-2 my-4 sm:my-5">
            <button
              onClick={() => {
                onClose();
                setIsSearchOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-2.5 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-900/80 transition-colors"
            >
              <Search className="w-4 h-4 text-emerald-400" /> Search Store
            </button>
            <button
              onClick={() => {
                onClose();
                setIsCartOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors shadow-md"
            >
              <ShoppingBag className="w-4 h-4" /> Cart ({cartCount})
            </button>
          </div>

          {/* Primary Navigation Links */}
          <div className="space-y-3 pt-1">
            <button
              onClick={() => {
                navigateToHome();
                onClose();
              }}
              className="w-full text-left py-2 font-bold text-base border-b border-emerald-950/80 hover:text-emerald-400 transition-colors"
            >
              Home
            </button>

            <button
              onClick={() => {
                navigateToShop();
                onClose();
              }}
              className="w-full text-left py-2 font-bold text-base border-b border-emerald-950/80 hover:text-emerald-400 transition-colors"
            >
              Shop All
            </button>

            <button
              onClick={() => {
                navigateToSale();
                onClose();
              }}
              className="w-full text-left py-2 font-bold text-base border-b border-emerald-950/80 text-rose-400 flex items-center justify-between hover:text-rose-300 transition-colors"
            >
              <span>Sale Deals</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-400 font-extrabold uppercase animate-pulse">
                DEALS
              </span>
            </button>

            {/* Collections Accordion */}
            <div className="border-b border-emerald-950/80 py-2">
              <button
                onClick={() => setOpenSection(openSection === "collections" ? null : "collections")}
                className="w-full flex items-center justify-between font-bold text-base text-left hover:text-emerald-400 transition-colors"
              >
                <span>Shop Collections</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSection === "collections" ? "rotate-180 text-emerald-400" : ""}`} />
              </button>

              {openSection === "collections" && (
                <div className="mt-3 pl-3 space-y-2.5 border-l-2 border-emerald-800/40">
                  <button
                    onClick={() => {
                      navigateToCollectionsList();
                      onClose();
                    }}
                    className="block text-xs font-bold text-emerald-400 hover:underline"
                  >
                    → View All Collections
                  </button>
                  {collections.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        navigateToCollection(col.handle);
                        onClose();
                      }}
                      className="block text-xs text-slate-300 hover:text-emerald-300 transition-colors text-left w-full"
                    >
                      {col.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                navigateToAbout();
                onClose();
              }}
              className="w-full text-left py-2 font-bold text-base border-b border-emerald-950/80 hover:text-emerald-400 transition-colors flex items-center justify-between"
            >
              <span>About Us</span>
              <Info className="w-4 h-4 text-emerald-400/80" />
            </button>

            <button
              onClick={() => {
                navigateToContact();
                onClose();
              }}
              className="w-full text-left py-2 font-bold text-base border-b border-emerald-950/80 hover:text-emerald-400 transition-colors flex items-center justify-between"
            >
              <span>Contact Support</span>
              <PhoneCall className="w-4 h-4 text-emerald-400/80" />
            </button>

            <button
              onClick={() => {
                navigateToFAQ();
                onClose();
              }}
              className="w-full text-left py-2 font-bold text-base border-b border-emerald-950/80 hover:text-emerald-400 transition-colors flex items-center justify-between"
            >
              <span>FAQ & Support</span>
              <HelpCircle className="w-4 h-4 text-emerald-400/80" />
            </button>

            <button
              onClick={() => {
                navigateToBlog();
                onClose();
              }}
              className="w-full text-left py-2 font-bold text-base border-b border-emerald-950/80 hover:text-emerald-400 transition-colors"
            >
              Blogs & Tech Articles
            </button>

            <button
              onClick={() => {
                navigateToAccount();
                onClose();
              }}
              className="w-full text-left py-2 font-bold text-base border-b border-emerald-950/80 hover:text-emerald-400 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4 text-emerald-400" /> Customer Account
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-5 border-t border-emerald-900/40 space-y-2 text-xs text-slate-400 mt-6">
          <p className="flex items-center gap-1.5 font-medium">
            <Globe className="w-4 h-4 text-emerald-400" /> Currency: PKR (Rs.)
          </p>
          <p className="text-[11px] font-mono text-emerald-400/90 font-semibold">
            TheReviveTech Official Online Store
          </p>
        </div>
      </div>
    </>
  );
};
