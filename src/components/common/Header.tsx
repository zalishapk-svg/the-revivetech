import React, { useState } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu as MenuIcon,
  X,
  ChevronDown,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";

export const Header: React.FC = () => {
  const {
    viewState,
    navigateToHome,
    navigateToShop,
    navigateToCollectionsList,
    navigateToBlog,
    navigateToAccount,
    navigateToAbout,
    navigateToContact,
    navigateToFAQ,
    cartCount,
    setIsCartOpen,
    wishlistHandles,
    setIsWishlistOpen,
    compareHandles,
    setIsCompareOpen,
    setIsSearchOpen,
    customer,
  } = useShopify();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#05140b]/90 backdrop-blur-xl border-b border-emerald-900/40 text-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          <button
            onClick={navigateToHome}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white uppercase font-mono flex items-center gap-1">
                THEREVIVE<span className="text-emerald-400">TECH</span>
              </span>
              <span className="block text-[9px] text-emerald-400/80 font-mono tracking-widest uppercase">
                HEADLESS SHOPIFY STORE
              </span>
            </div>
          </button>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
            <button
              onClick={navigateToHome}
              className={`transition-colors hover:text-emerald-400 ${
                viewState.type === "home" ? "text-emerald-400 font-bold" : "text-slate-300"
              }`}
            >
              Home
            </button>

            <button
              onClick={navigateToShop}
              className={`transition-colors hover:text-emerald-400 ${
                viewState.type === "shop" ? "text-emerald-400 font-bold" : "text-slate-300"
              }`}
            >
              Shop Catalog
            </button>

            {/* COLLECTIONS / MEGA MENU TRIGGER */}
            <div
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
            >
              <button
                onClick={() => {
                  navigateToCollectionsList();
                  setIsMegaMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 py-2 transition-colors hover:text-emerald-400 ${
                  viewState.type === "collection" || viewState.type === "collections_list"
                    ? "text-emerald-400 font-bold"
                    : "text-slate-300"
                }`}
              >
                <span>Collections</span>
                <ChevronDown
                  className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${
                    isMegaMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            <button
              onClick={navigateToAbout}
              className={`transition-colors hover:text-emerald-400 ${
                viewState.type === "about" ? "text-emerald-400 font-bold" : "text-slate-300"
              }`}
            >
              About
            </button>

            <button
              onClick={navigateToContact}
              className={`transition-colors hover:text-emerald-400 ${
                viewState.type === "contact" ? "text-emerald-400 font-bold" : "text-slate-300"
              }`}
            >
              Contact
            </button>

            <button
              onClick={navigateToFAQ}
              className={`transition-colors hover:text-emerald-400 ${
                viewState.type === "faq" ? "text-emerald-400 font-bold" : "text-slate-300"
              }`}
            >
              FAQ
            </button>

            <button
              onClick={navigateToBlog}
              className={`transition-colors hover:text-emerald-400 ${
                viewState.type === "blog" || viewState.type === "article"
                  ? "text-emerald-400 font-bold"
                  : "text-slate-300"
              }`}
            >
              Journal
            </button>
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* SEARCH BUTTON (CMD+K) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-900/50 border border-emerald-800/40 text-slate-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              title="Search store (CMD+K)"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Search</span>
              <kbd className="hidden lg:inline-block bg-slate-900 border border-emerald-800/60 text-[10px] text-slate-400 px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </button>

            {/* MOBILE SEARCH ICON */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-slate-300 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* COMPARE ICON */}
            {compareHandles.length > 0 && (
              <button
                onClick={() => setIsCompareOpen(true)}
                className="relative p-2 text-slate-300 hover:text-emerald-400 transition-colors"
                title="Compare Products"
              >
                <Layers className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {compareHandles.length}
                </span>
              </button>
            )}

            {/* WISHLIST ICON */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 text-slate-300 hover:text-emerald-400 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistHandles.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistHandles.length}
                </span>
              )}
            </button>

            {/* ACCOUNT ICON */}
            <button
              onClick={navigateToAccount}
              className={`p-2 transition-colors ${
                customer ? "text-emerald-400" : "text-slate-300 hover:text-white"
              }`}
              title={customer ? `Account: ${customer.firstName}` : "Sign In"}
            >
              <User className="w-5 h-5" />
            </button>

            {/* CART BUTTON */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-950/50 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs uppercase tracking-wider">Cart</span>
              <span className="bg-slate-950 text-emerald-400 text-xs font-mono font-bold px-2 py-0.5 rounded-md ml-1">
                {cartCount}
              </span>
            </button>

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:text-white"
              aria-label="Open Mobile Menu"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

          </div>

        </div>
      </div>

      {/* MEGA MENU OVERLAY */}
      <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />

      {/* MOBILE DRAWER NAV */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </header>
  );
};
