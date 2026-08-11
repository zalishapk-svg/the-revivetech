import React, { useState } from "react";
import { Heart, Eye, ShoppingBag, Check } from "lucide-react";
import { Product } from "../../types";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney, calculateDiscount } from "../../lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = "" }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewHandle,
    navigateToProduct,
    showToast,
  } = useShopify();

  const [isAdded, setIsAdded] = useState(false);

  const isWishlisted = isInWishlist(product.handle);
  const primaryImage = product.featuredImage?.url || product.images[0]?.url;
  const secondImage = product.images.length > 1 ? product.images[1].url : null;

  const priceAmount = product.priceRange?.minVariantPrice?.amount || "0";
  const currencyCode = product.priceRange?.minVariantPrice?.currencyCode || "PKR";
  const compareAtAmount = product.compareAtPriceRange?.minVariantPrice?.amount;

  const discountPercent = calculateDiscount(priceAmount, compareAtAmount);
  const hasDiscount = discountPercent > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    showToast(`Added ${product.title.slice(0, 25)}... to cart`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.handle);
    showToast(isWishlisted ? "Removed from Wishlist" : "Saved to Wishlist");
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewHandle(product.handle);
  };

  return (
    <div
      onClick={() => navigateToProduct(product.handle)}
      className={`group relative bg-slate-900/90 rounded-xl overflow-hidden border border-emerald-900/30 hover:border-emerald-500/60 transition-all duration-300 hover:shadow-[0_12px_30px_rgba(16,185,129,0.15)] flex flex-col justify-between cursor-pointer h-full select-none ${className}`}
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {hasDiscount && (
          <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded shadow-md tracking-wider">
            -{discountPercent}% OFF
          </span>
        )}
        {!product.availableForSale && (
          <span className="bg-rose-950/90 text-rose-300 border border-rose-800/50 text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded shadow-md">
            OUT OF STOCK
          </span>
        )}
      </div>

      {/* Image Container with Hover Second Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-950/80">
        {primaryImage ? (
          <>
            {/* Primary Image */}
            <img
              src={primaryImage}
              alt={product.title}
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                secondImage
                  ? "group-hover:opacity-0 group-hover:scale-105"
                  : "group-hover:scale-105"
              }`}
            />
            {/* Second Image Crossfade */}
            {secondImage && (
              <img
                src={secondImage}
                alt={`${product.title} alternate view`}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
            No Image
          </div>
        )}

        {/* Hover Action Overlay Icons - Staggered Slide In */}
        <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-2 px-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            aria-label="Toggle Wishlist"
            title="Add to Wishlist"
            className={`p-2.5 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 delay-75 hover:scale-110 focus:outline-none ${
              isWishlisted
                ? "bg-rose-500 text-white border-rose-400"
                : "bg-slate-950/80 text-slate-200 hover:bg-emerald-500 hover:text-slate-950 border-emerald-500/30"
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
          </button>

          {/* Quick View Button */}
          <button
            onClick={handleQuickView}
            aria-label="Quick View"
            title="Quick View"
            className="p-2.5 rounded-full bg-slate-950/80 text-slate-200 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 backdrop-blur-md shadow-lg transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 delay-100 hover:scale-110 focus:outline-none"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.availableForSale}
            aria-label="Add to Cart"
            title={product.availableForSale ? "Add to Cart" : "Out of Stock"}
            className={`p-2.5 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 delay-150 hover:scale-110 focus:outline-none ${
              isAdded
                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                : "bg-slate-950/80 text-slate-200 hover:bg-emerald-500 hover:text-slate-950 border-emerald-500/30 disabled:opacity-50 disabled:hover:bg-slate-950"
            }`}
          >
            {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          {/* Vendor */}
          {product.vendor && (
            <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-semibold block mb-1">
              {product.vendor}
            </span>
          )}
          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 group-hover:text-emerald-400 transition-colors duration-200 leading-snug">
            {product.title}
          </h3>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-extrabold text-white font-mono">
              {formatMoney(priceAmount, currencyCode)}
            </span>
            {hasDiscount && compareAtAmount && (
              <span className="text-xs text-slate-500 line-through font-mono">
                {formatMoney(compareAtAmount, currencyCode)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
              Save {formatMoney(parseFloat(compareAtAmount!) - parseFloat(priceAmount), currencyCode)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
