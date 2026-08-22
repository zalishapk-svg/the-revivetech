import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Layers,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle,
  ThumbsUp,
  MapPin,
  MessageSquare,
  Sparkles,
  Share2,
  Eye,
  Cpu,
  FileText,
} from "lucide-react";
import { ProductCarousel } from "../common/ProductCarousel";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney, calculateDiscount, hasCompareAtDiscount } from "../../lib/utils";
import { getProductReviews } from "../../lib/reviews";
import { Product } from "../../types";

interface ProductPageProps {
  handle: string;
}

export const ProductPage: React.FC<ProductPageProps> = ({ handle }) => {
  const {
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    navigateToProduct,
    navigateToShop,
    showToast,
    fetchProductByHandle,
  } = useShopify();

  const productFromList = useMemo(() => products.find((p) => p.handle === handle), [products, handle]);
  const [directProduct, setDirectProduct] = useState<Product | null>(productFromList || null);
  const [isLoading, setIsLoading] = useState<boolean>(!productFromList);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  const product = productFromList || directProduct;

  useEffect(() => {
    let isMounted = true;
    if (productFromList) {
      setDirectProduct(productFromList);
      setIsLoading(false);
      setIsNotFound(false);
      return;
    }

    setIsLoading(true);
    setIsNotFound(false);

    fetchProductByHandle(handle)
      .then((p) => {
        if (!isMounted) return;
        if (p) {
          setDirectProduct(p);
          setIsNotFound(false);
        } else {
          setIsNotFound(true);
        }
      })
      .catch((err) => {
        console.error("Error loading product:", err);
        if (!isMounted) return;
        setIsNotFound(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [handle, productFromList, fetchProductByHandle]);

  const reviewSummary = useMemo(() => {
    return product ? getProductReviews(product) : { reviews: [], averageRating: 4.9, totalReviews: 0, ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  }, [product?.handle, product?.id]);

  // Filter out default dummy options (e.g. name "Title" with value "Default Title")
  const validOptions = useMemo(() => {
    if (!product?.options) return [];
    return product.options.filter((opt) => {
      const isTitleDefault = opt.name.toLowerCase() === "title" && opt.values.every((v) => v.toLowerCase() === "default title" || v.toLowerCase() === "default");
      const isSingleDefaultValue = opt.values.length === 1 && (opt.values[0].toLowerCase() === "default title" || opt.values[0].toLowerCase() === "default");
      return !isTitleDefault && !isSingleDefaultValue;
    });
  }, [product?.options]);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product?.variants?.[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "reviews" | "shipping">("overview");

  useEffect(() => {
    if (product?.variants?.[0]?.id) {
      setSelectedVariantId(product.variants[0].id);
    } else {
      setSelectedVariantId(undefined);
    }
    setSelectedImageIdx(0);
    setQuantity(1);
  }, [product?.id, product?.handle]);

  if (isLoading || (!product && !isNotFound)) {
    return (
      <div className="bg-[#161616] text-slate-100 min-h-screen py-20 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        <p className="text-sm font-mono text-emerald-400">Loading product hardware details...</p>
      </div>
    );
  }

  if (isNotFound || !product) {
    return (
      <div className="bg-[#161616] text-slate-100 min-h-screen py-20 flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <h2 className="text-2xl font-black text-white font-mono">Product Not Found</h2>
        <p className="text-sm text-slate-400 max-w-md">
          The requested product hardware could not be located or may be temporarily unavailable.
        </p>
        <button
          onClick={() => navigateToShop()}
          className="mt-4 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : product.featuredImage ? [product.featuredImage] : [];
  const isWishlisted = isInWishlist(product.handle);
  const isCompared = isInCompare(product.handle);

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId) || product.variants?.[0];

  const priceAmount = selectedVariant
    ? selectedVariant.price.amount
    : (product.priceRange?.minVariantPrice?.amount || "0.00");

  const compareAtAmount = selectedVariant
    ? selectedVariant.compareAtPrice?.amount
    : product.compareAtPriceRange?.minVariantPrice?.amount;

  const hasDiscount = hasCompareAtDiscount(priceAmount, compareAtAmount);
  const discountPercent = hasDiscount ? calculateDiscount(priceAmount, compareAtAmount) : 0;
  const isAvailable = selectedVariant ? selectedVariant.availableForSale : product.availableForSale;

  const relatedProducts = products.filter((p) => p.handle !== product.handle).slice(0, 4);

  return (
    <div className="bg-[#161616] text-slate-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumb */}
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ""; }} className="hover:text-emerald-400">Home</a>
          <span>/</span>
          <span className="text-emerald-400 font-bold">{product.vendor}</span>
          <span>/</span>
          <span className="text-white line-clamp-1">{product.title}</span>
        </div>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Gallery Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-[#1c1c1c] border border-emerald-800/50 aspect-square shadow-2xl">
              {images[selectedImageIdx] && (
                <img
                  src={images[selectedImageIdx].url}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )}
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-rose-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  SAVE {discountPercent}% NOW
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-[#1c1c1c] shrink-0 transition-all cursor-pointer ${
                      selectedImageIdx === idx ? "border-emerald-400 scale-105" : "border-emerald-900/40 hover:border-emerald-700"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-5 space-y-6 bg-[#1c1c1c] border border-emerald-800/50 p-6 sm:p-8 rounded-3xl shadow-xl">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800/40">
                {product.vendor}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight">{product.title}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(reviewSummary.averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-white font-mono">{reviewSummary.averageRating}</span>
                <span className="text-slate-400">({reviewSummary.totalReviews} customer reviews)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[#161616] rounded-2xl border border-emerald-900/40 flex items-baseline gap-3">
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {formatMoney(priceAmount)}
              </span>
              {hasDiscount && compareAtAmount && (
                <span className="text-sm line-through text-slate-500 font-mono">
                  {formatMoney(compareAtAmount)}
                </span>
              )}
              {!isAvailable && (
                <span className="ml-auto text-[11px] text-rose-400 font-mono font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Variant Selector - Only shown if real variants exist */}
            {validOptions.length > 0 && validOptions.map((opt, oIdx) => (
              <div key={oIdx} className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase font-mono">{opt.name}:</label>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val, vIdx) => {
                    const variantForOpt = product.variants?.[vIdx] || product.variants?.[0];
                    const isSelected = selectedVariantId === variantForOpt?.id || (vIdx === 0 && !selectedVariantId);
                    return (
                      <button
                        key={vIdx}
                        onClick={() => setSelectedVariantId(variantForOpt?.id)}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md"
                            : "bg-[#161616] text-slate-300 border-emerald-900/40 hover:border-emerald-700"
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-emerald-800/60 rounded-xl bg-[#161616] overflow-hidden px-2 py-1">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-2 text-slate-300 font-bold hover:text-white cursor-pointer">-</button>
                  <span className="px-3 font-mono font-bold text-xs text-white">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="px-2 text-slate-300 font-bold hover:text-white cursor-pointer">+</button>
                </div>

                <button
                  disabled={!isAvailable}
                  onClick={() => addToCart(product, selectedVariantId, quantity)}
                  className={`flex-1 py-4 font-black text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xl ${
                    isAvailable
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60 cursor-pointer"
                      : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" /> {isAvailable ? `Add to Cart (${quantity})` : "Out of Stock"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleWishlist(product.handle)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isWishlisted ? "bg-rose-950/60 border-rose-500 text-rose-400" : "bg-[#161616] border-emerald-900/40 text-slate-300 hover:text-white"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-400" : ""}`} /> Wishlist
                </button>

                <button
                  onClick={() => toggleCompare(product.handle)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isCompared ? "bg-amber-950/60 border-amber-500 text-amber-400" : "bg-[#161616] border-emerald-900/40 text-slate-300 hover:text-white"
                  }`}
                >
                  <Layers className="w-4 h-4" /> Compare Specs
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-emerald-900/40 text-[11px] text-slate-400 text-center">
              <div className="p-2 bg-[#161616] rounded-xl border border-emerald-900/30">
                <Truck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span>Express Shipping</span>
              </div>
              <div className="p-2 bg-[#161616] rounded-xl border border-emerald-900/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span>Authentic Product</span>
              </div>
              <div className="p-2 bg-[#161616] rounded-xl border border-emerald-900/30">
                <RotateCcw className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span>30-Day Returns</span>
              </div>
            </div>

          </div>

        </div>

        {/* Product Specs & Tabs - Fully Responsive with Icons */}
        <div className="bg-[#1c1c1c] border border-emerald-800/50 rounded-3xl p-4 sm:p-8 space-y-6">
          <div className="flex border-b border-emerald-900/40 gap-2 sm:gap-6 text-xs sm:text-sm font-bold font-mono overflow-x-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 border-b-2 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-0 shrink-0 cursor-pointer ${
                activeTab === "overview" ? "border-emerald-400 text-emerald-400" : "border-transparent text-slate-400 hover:text-white"
              }`}
              title="Overview & Architecture"
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Overview & Architecture</span>
              <span className="sm:hidden">Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-3 border-b-2 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-0 shrink-0 cursor-pointer ${
                activeTab === "specs" ? "border-emerald-400 text-emerald-400" : "border-transparent text-slate-400 hover:text-white"
              }`}
              title="Full Specifications"
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Full Specifications</span>
              <span className="sm:hidden">Specs</span>
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 border-b-2 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-0 shrink-0 cursor-pointer ${
                activeTab === "reviews" ? "border-emerald-400 text-emerald-400" : "border-transparent text-slate-400 hover:text-white"
              }`}
              title="Customer Reviews"
            >
              <Star className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Customer Reviews ({reviewSummary.totalReviews})</span>
              <span className="sm:hidden">Reviews ({reviewSummary.totalReviews})</span>
            </button>
          </div>

          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeTab === "overview" && (
              <div className="space-y-4">
                {product.seo?.description ? (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {product.seo.description}
                  </p>
                ) : null}
                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-emerald-900/30">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between p-3 bg-[#161616] rounded-xl border border-emerald-900/30 font-mono text-xs">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-emerald-400 font-bold">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="space-y-6">
                {(product.descriptionHtml || product.description) ? (
                  <div
                    className="product-description-content text-slate-300 leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{
                      __html: product.descriptionHtml || product.description,
                    }}
                  />
                ) : (
                  <p className="text-slate-400 italic font-mono text-xs">No detailed specifications provided for this product.</p>
                )}

                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-emerald-900/30 font-mono">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between p-3 bg-[#161616] rounded-xl border border-emerald-900/30">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-emerald-400 font-bold">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Summary Box */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-[#161616] rounded-2xl border border-emerald-900/40 items-center">
                  {/* Left: Rating & Stars */}
                  <div className="md:col-span-4 text-center md:text-left space-y-1 border-b md:border-b-0 md:border-r border-emerald-900/30 pb-4 md:pb-0 md:pr-4">
                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                      <span className="text-4xl font-black text-white font-mono">{reviewSummary.averageRating}</span>
                      <span className="text-sm text-slate-400 font-mono">/ 5.0</span>
                    </div>
                    <div className="flex justify-center md:justify-start text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(reviewSummary.averageRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      Based on <strong className="text-emerald-400">{reviewSummary.totalReviews} customer reviews</strong>
                    </p>
                  </div>

                  {/* Center: Rating Breakdown */}
                  <div className="md:col-span-5 space-y-1.5 font-mono text-xs">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviewSummary.ratingBreakdown[stars as keyof typeof reviewSummary.ratingBreakdown] || 0;
                      const pct = reviewSummary.totalReviews ? Math.round((count / reviewSummary.totalReviews) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="w-8 text-slate-400 shrink-0 text-right">{stars} ★</span>
                          <div className="flex-1 h-2 bg-[#1c1c1c] rounded-full overflow-hidden border border-emerald-950">
                            <div
                              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 text-slate-400 shrink-0 text-left text-[11px]">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Guarantee Badge */}
                  <div className="md:col-span-3 bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/40 text-center space-y-1.5">
                    <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="text-[11px] font-bold text-emerald-300">Verified Customer Reviews</p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Authentic feedback from tech enthusiasts across Pakistan.
                    </p>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4 pt-2">
                  {reviewSummary.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 bg-[#161616] rounded-2xl border border-emerald-900/40 hover:border-emerald-800/60 transition-colors space-y-3"
                    >
                      {/* Review Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {/* Avatar Circle */}
                          <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-300 font-bold font-mono text-sm shadow-inner shrink-0">
                            {rev.author.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-xs sm:text-sm">{rev.author}</h4>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                                <CheckCircle className="w-3 h-3 fill-emerald-400 text-slate-950" />
                                Verified Buyer
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1 text-slate-400">
                                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                                {rev.location}, PK
                              </span>
                              <span>•</span>
                              <span>{rev.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="space-y-1 pl-0 sm:pl-12">
                        <h5 className="font-bold text-emerald-300 text-xs sm:text-sm">{rev.title}</h5>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">{rev.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="pt-6">
            <ProductCarousel
              title="You Might Also Need"
              subtitle="Complementary hardware and accessories frequently paired with this setup."
              badgeText="RECOMMENDED ACCESSORIES"
              products={relatedProducts}
            />
          </div>
        )}

      </div>
    </div>
  );
};
