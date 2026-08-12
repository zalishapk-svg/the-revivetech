import React from "react";
import { Home, Store, Grid, Heart, ShoppingBag } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const BottomNav: React.FC = () => {
  const {
    viewState,
    navigateToHome,
    navigateToShop,
    navigateToCollectionsList,
    wishlistHandles,
    setIsWishlistOpen,
    cartCount,
    setIsCartOpen,
  } = useShopify();

  const currentType = viewState.type;

  const isHomeActive = currentType === "home";
  const isShopActive = currentType === "shop" || currentType === "explore_all" || currentType === "sale";
  const isCollectionsActive = currentType === "collections_list" || currentType === "collection";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#030a06]/95 backdrop-blur-lg border-t border-emerald-900/50 shadow-[0_-8px_25px_rgba(0,0,0,0.8)] pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 px-2 sm:px-6">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center">
        
        {/* HOME */}
        <button
          onClick={navigateToHome}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
            isHomeActive ? "text-[#BFFF2B]" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-label="Home"
        >
          {isHomeActive && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#BFFF2B] rounded-full shadow-[0_0_8px_#BFFF2B]" />
          )}
          <Home className="w-5 h-5 mb-0.5 transition-transform duration-200" />
          <span className="text-[10px] font-medium tracking-tight">Home</span>
        </button>

        {/* SHOP */}
        <button
          onClick={navigateToShop}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
            isShopActive ? "text-[#BFFF2B]" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-label="Shop"
        >
          {isShopActive && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#BFFF2B] rounded-full shadow-[0_0_8px_#BFFF2B]" />
          )}
          <Store className="w-5 h-5 mb-0.5 transition-transform duration-200" />
          <span className="text-[10px] font-medium tracking-tight">Shop</span>
        </button>

        {/* COLLECTIONS */}
        <button
          onClick={navigateToCollectionsList}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
            isCollectionsActive ? "text-[#BFFF2B]" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-label="Collections"
        >
          {isCollectionsActive && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#BFFF2B] rounded-full shadow-[0_0_8px_#BFFF2B]" />
          )}
          <Grid className="w-5 h-5 mb-0.5 transition-transform duration-200" />
          <span className="text-[10px] font-medium tracking-tight">Collections</span>
        </button>

        {/* WISHLIST */}
        <button
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all duration-200 active:scale-95"
          aria-label="Wishlist"
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5 transition-transform duration-200" />
            {wishlistHandles.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-slate-950">
                {wishlistHandles.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Wishlist</span>
        </button>

        {/* CART */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all duration-200 active:scale-95"
          aria-label="Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 transition-transform duration-200" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#BFFF2B] text-slate-950 font-extrabold text-[9px] px-1.5 py-0.2 rounded-full min-w-[16px] h-4 flex items-center justify-center border border-slate-950">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Cart</span>
        </button>

      </div>
    </nav>
  );
};
