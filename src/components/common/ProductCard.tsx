import React, { useState, useMemo } from "react";
import { Heart, Eye, ShoppingBag, Check, Layers } from "lucide-react";
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
    toggleCompare,
    isInCompare,
    setQuickViewHandle,
    navigateToProduct,
    showToast,
  } = useShopify();

  const [isAdded, setIsAdded] = useState(false);

  const isWishlisted = isInWishlist(product.handle);
  const isCompared = isInCompare(product.handle);

  const primaryImage = product.featuredImage?.url || (product.images && product.images[0]?.url);

  // Safely extract second image if available and distinct from primary image
  const secondImage = useMemo(() => {
    if (!product.images || product.images.length < 2) return null;
    const second = product.images[1]?.url;
    if (!second || second === primaryImage) return null;
    return second;
  }, [product.images, primaryImage]);

  const priceAmount = product.priceRange?.minVariantPrice?.amount || "0";
  const currencyCode = product.priceRange?.minVariantPrice?.currencyCode || "PKR";
  const compareAtAmount = product.compareAtPriceRange?.minVariantPrice?.amount;

  const discountPercent = calculateDiscount(priceAmount, compareAtAmount);
  const hasDiscount = discountPercent > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.availableForSale) return;
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

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(product.handle);
    showToast(isCompared ? "Removed from Compare" : "Added to Compare");
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewHandle(product.handle);
  };

  return (
    <div
      onClick={() => navigateToProduct(product.handle)}
      className={`group/productcard relative bg-gradient-to-b from-[#082015] via-[#04140c] to-[#020b06] rounded-2xl overflow-hidden border border-emerald-900/50 transition-all duration-300 hover:border-emerald-500 hover:shadow-[0_12px_30px_rgba(16,185,129,0.15)] flex flex-col justify-between cursor-pointer h-full select-none ${className}`}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
        {hasDiscount && (
          <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-md shadow-md tracking-wider">
            -{discountPercent}% OFF
          </span>
        )}
        {!product.availableForSale && (
          <span className="bg-rose-950/90 text-rose-300 border border-rose-800/50 text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-md shadow-md">
            OUT OF STOCK
          </span>
        )}
      </div>

      {/* Image Container with Hover Second Image Crossfade */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#020b05]/90">
        {primaryImage ? (
          <>
            {/* Primary Image */}
            <img
              src={primaryImage}
              alt={product.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-out ${
                secondImage
                  ? "opacity-100 group-hover/productcard:opacity-0 group-hover/productcard:scale-105"
                  : "group-hover/productcard:scale-105"
              }`}
            />

            {/* Second Image Crossfade (only rendered if distinct 2nd image exists) */}
            {secondImage && (
              <img
                src={secondImage}
                alt={`${product.title} alternate view`}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover/productcard:opacity-100 transition-all duration-500 ease-out scale-100 group-hover/productcard:scale-105 pointer-events-none"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
            No Image
          </div>
        )}

        {/* Hover Action Overlay Icons - Smooth Animated Entrance & Exit */}
        <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-2 px-3 pointer-events-none group-hover/productcard:pointer-events-auto">
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            aria-label="Toggle Wishlist"
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            className={`p-2.5 rounded-full shadow-xl border backdrop-blur-md transition-all duration-300 ease-out transform opacity-0 translate-y-4 scale-90 group-hover/productcard:opacity-100 group-hover/productcard:translate-y-0 group-hover/productcard:scale-100 delay-0 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer ${
              isWishlisted
                ? "bg-rose-500 text-white border-rose-400"
                : "bg-slate-950/85 text-slate-200 hover:bg-emerald-500 hover:text-slate-950 border-emerald-500/40"
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
          </button>

          {/* Compare Button */}
          <button
            onClick={handleToggleCompare}
            aria-label="Compare Product"
            title={isCompared ? "Remove from Compare" : "Compare Product"}
            className={`p-2.5 rounded-full shadow-xl border backdrop-blur-md transition-all duration-300 ease-out transform opacity-0 translate-y-4 scale-90 group-hover/productcard:opacity-100 group-hover/productcard:translate-y-0 group-hover/productcard:scale-100 delay-75 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer ${
              isCompared
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                : "bg-slate-950/85 text-slate-200 hover:bg-emerald-500 hover:text-slate-950 border-emerald-500/40"
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Quick View Button */}
          <button
            onClick={handleQuickView}
            aria-label="Quick View"
            title="Quick View"
            className="p-2.5 rounded-full bg-slate-950/85 text-slate-200 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/40 backdrop-blur-md shadow-xl transition-all duration-300 ease-out transform opacity-0 translate-y-4 scale-90 group-hover/productcard:opacity-100 group-hover/productcard:translate-y-0 group-hover/productcard:scale-100 delay-100 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.availableForSale}
            aria-label="Add to Cart"
            title={product.availableForSale ? "Add to Cart" : "Out of Stock"}
            className={`p-2.5 rounded-full shadow-xl border backdrop-blur-md transition-all duration-300 ease-out transform opacity-0 translate-y-4 scale-90 group-hover/productcard:opacity-100 group-hover/productcard:translate-y-0 group-hover/productcard:scale-100 delay-150 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer ${
              isAdded
                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                : "bg-slate-950/85 text-slate-200 hover:bg-emerald-500 hover:text-slate-950 border-emerald-500/40 disabled:opacity-50 disabled:hover:bg-slate-950"
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
            <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-bold block mb-1">
              {product.vendor}
            </span>
          )}
          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-2 group-hover/productcard:text-emerald-300 transition-colors duration-200 leading-snug">
            {product.title}
          </h3>
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-2.5 border-t border-emerald-900/30 flex items-center justify-between">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">
              {formatMoney(priceAmount, currencyCode)}
            </span>
            {hasDiscount && compareAtAmount && (
              <span className="text-[11px] text-slate-500 line-through font-mono">
                {formatMoney(compareAtAmount, currencyCode)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
