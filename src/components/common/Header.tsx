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

export const Header: React.FC = () => {
  const {
    viewState,
    navigateToHome,
    navigateToShop,
    navigateToSale,
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
    setIsMobileNavOpen,
  } = useShopify();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#030705]/95 backdrop-blur-md border-b border-emerald-900/40 text-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* LOGO */}
          <button
            onClick={navigateToHome}
            className="flex items-center group text-left focus:outline-none py-1 shrink-0"
          >
            <img
              src="https://cdn.shopify.com/s/files/1/0610/4642/3631/files/Artboard_1_copy.png?v=1786431651"
              alt="The Revive Tech Logo"
              referrerPolicy="no-referrer"
              className="h-7 xs:h-8 sm:h-11 w-auto max-w-[120px] xs:max-w-[150px] sm:max-w-[240px] object-contain transition-transform duration-300 group-hover:scale-105"
            />
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
              Shop
            </button>

            {/* COLLECTIONS / MEGA MENU TRIGGER */}
            <div className="relative">
              <button
                onClick={() => setIsMegaMenuOpen((prev) => !prev)}
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
              onClick={navigateToSale}
              className={`transition-colors hover:text-rose-400 flex items-center gap-1.5 ${
                viewState.type === "sale" ? "text-rose-400 font-bold" : "text-slate-300"
              }`}
            >
              <span>Sale</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/80 font-extrabold uppercase animate-pulse">
                DEALS
              </span>
            </button>

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
              Blogs
            </button>
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-4 shrink-0">
            
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
              className="sm:hidden p-1.5 text-slate-300 hover:text-white"
              aria-label="Search Store"
            >
              <Search className="w-5 h-5 text-emerald-400" />
            </button>

            {/* COMPARE ICON */}
            {compareHandles.length > 0 && (
              <button
                onClick={() => setIsCompareOpen(true)}
                className="relative p-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
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
              className="relative p-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
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
              className={`p-1.5 transition-colors ${
                customer ? "text-emerald-400" : "text-slate-300 hover:text-white"
              }`}
              title={customer ? `Account: ${customer.firstName}` : "Sign In"}
            >
              <User className="w-5 h-5" />
            </button>

            {/* CART BUTTON */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs uppercase tracking-wider">Cart</span>
              <span className="bg-slate-950 text-emerald-400 text-xs font-mono font-bold px-1.5 py-0.5 rounded-md">
                {cartCount}
              </span>
            </button>

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-lg focus:outline-none active:scale-95"
              aria-label="Open Mobile Menu"
            >
              <MenuIcon className="w-6 h-6 text-emerald-400" />
            </button>

          </div>

        </div>
      </div>

      {/* MEGA MENU OVERLAY */}
      <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
    </header>
  );
};
