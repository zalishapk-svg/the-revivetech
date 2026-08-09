import React, { useState, useMemo } from "react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney, calculateDiscount } from "../../lib/utils";
import { YellowTape } from "../common/YellowTape";
import { 
  Search, SlidersHorizontal, Grid, List, Check, X,
  Eye, Heart, ArrowUpDown, ChevronRight, ShoppingBag, RefreshCw, Star, Tag, Sparkles
} from "lucide-react";

export const ShopPage: React.FC = () => {
  const { 
    products, collections, addToCart, toggleWishlist, isInWishlist, 
    toggleCompare, isInCompare, setQuickViewHandle, navigateToProduct, navigateToCollection 
  } = useShopify();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract unique vendors & categories
  const vendors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { if (p.vendor) set.add(p.vendor); });
    return Array.from(set).sort();
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { if (p.productType) set.add(p.productType); });
    return Array.from(set).sort();
  }, [products]);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchVendor = p.vendor.toLowerCase().includes(q);
        const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchVendor && !matchTags) return false;
      }

      // Category / Type
      if (selectedCategory !== "all" && p.productType !== selectedCategory) return false;

      // Vendor / Brand
      if (selectedVendor !== "all" && p.vendor !== selectedVendor) return false;

      // Stock
      if (inStockOnly && !p.availableForSale) return false;

      // Sale
      if (onSaleOnly && !p.compareAtPriceRange?.minVariantPrice?.amount) return false;

      // Price limit
      const priceNum = parseFloat(p.priceRange.minVariantPrice.amount);
      if (priceNum > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
      const priceB = parseFloat(b.priceRange.minVariantPrice.amount);

      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "alpha-asc") return a.title.localeCompare(b.title);
      if (sortBy === "alpha-desc") return b.title.localeCompare(a.title);
      if (sortBy === "best-selling") return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      if (sortBy === "newest") return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      
      // Default: Featured
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedVendor, inStockOnly, onSaleOnly, maxPrice, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedCollection("all");
    setSelectedVendor("all");
    setInStockOnly(false);
    setOnSaleOnly(false);
    setMaxPrice(150000);
    setSortBy("featured");
  };

  return (
    <div className="w-full bg-[#030e07] text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ""; }} className="hover:text-emerald-400 transition-colors">
            Home
          </a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-emerald-400 font-semibold">Shop Catalog</span>
        </nav>

        {/* Shop Banner / Header */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#051a0d] via-[#082a15] to-[#030e07] border border-emerald-900/40 p-8 md:p-12 mb-10 overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60 inline-block mb-3">
              Official Hardware Store
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Explore Premium <YellowTape text="TECH CATALOG" />
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Browse our full collection of genuine gaming mice, custom mechanical keyboards, audiophile headsets, high-refresh displays, and battlestation accessories with official Pakistan warranty.
            </p>
          </div>
        </div>

        {/* Filter Toolbar Header */}
        <div className="bg-[#05140b] border border-emerald-900/40 rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          {/* Search bar inside catalog */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, specs..."
              className="w-full bg-[#030e07] border border-emerald-900/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="md:hidden flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-4 py-2 rounded-xl text-xs font-medium"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Product Count */}
            <span className="text-xs text-slate-400 font-mono">
              Showing <strong className="text-emerald-400">{filteredProducts.length}</strong> of {products.length} Products
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#030e07] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="featured">Featured</option>
                <option value="best-selling">Best Selling</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="alpha-asc">Alphabetical: A to Z</option>
              </select>

              {/* Layout Toggle */}
              <div className="hidden sm:flex border border-emerald-900/60 rounded-xl p-1 bg-[#030e07]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <aside className={`lg:block ${isMobileFilterOpen ? "block" : "hidden"} space-y-6 bg-[#05140b] border border-emerald-900/40 rounded-2xl p-6 h-fit shadow-xl`}>
            <div className="flex items-center justify-between border-b border-emerald-900/40 pb-4">
              <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" /> Filter Hardware
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#030e07] border border-emerald-900/60 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Vendor Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">Brand / Manufacturer</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full bg-[#030e07] border border-emerald-900/60 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Brands</option>
                {vendors.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Max Price Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Max Price</label>
                <span className="text-xs font-mono font-bold text-emerald-400">{formatMoney(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={250000}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-emerald-950 rounded-lg cursor-pointer h-1.5"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Rs. 5,000</span>
                <span>Rs. 250,000</span>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-3 pt-2 border-t border-emerald-900/40">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded bg-[#030e07] border-emerald-800 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <span>In Stock Only</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => setOnSaleOnly(e.target.checked)}
                  className="rounded bg-[#030e07] border-emerald-800 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <span>Special Sale Deals</span>
              </label>
            </div>

            {/* Quick Collection Links */}
            <div className="pt-4 border-t border-emerald-900/40">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">Popular Collections</label>
              <div className="space-y-1">
                {collections.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigateToCollection(c.handle)}
                    className="w-full text-left text-xs text-slate-400 hover:text-emerald-400 py-1 flex items-center justify-between group transition-colors"
                  >
                    <span>{c.title}</span>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid / List Section */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-[#05140b] border border-emerald-900/40 rounded-2xl p-12 text-center my-8">
                <div className="w-16 h-16 bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-800/40">
                  <Search className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Products Match Your Criteria</h3>
                <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto">
                  Try adjusting your filter settings, clearing search queries, or expanding your price threshold.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p) => {
                  const minPrice = p.priceRange.minVariantPrice.amount;
                  const comparePrice = p.compareAtPriceRange?.minVariantPrice?.amount;
                  const discountPct = calculateDiscount(minPrice, comparePrice);
                  const inWish = isInWishlist(p.handle);
                  const inComp = isInCompare(p.handle);

                  return (
                    <div
                      key={p.id}
                      className="group bg-[#05140b] border border-emerald-900/40 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/50 flex flex-col relative"
                    >
                      {/* Badge Row */}
                      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1 items-start">
                        {discountPct > 0 && (
                          <span className="bg-rose-500/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
                            -{discountPct}% OFF
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="bg-amber-500/90 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
                            Best Seller
                          </span>
                        )}
                      </div>

                      {/* Top Action Overlay Buttons */}
                      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(p.handle); }}
                          className={`p-2 rounded-xl backdrop-blur-md border transition-colors ${inWish ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-slate-950/80 text-slate-300 border-emerald-900/60 hover:text-emerald-400'}`}
                          title="Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 ${inWish ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setQuickViewHandle(p.handle); }}
                          className="p-2 rounded-xl bg-slate-950/80 border border-emerald-900/60 text-slate-300 hover:text-emerald-400 transition-colors"
                          title="Quick View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCompare(p.handle); }}
                          className={`p-2 rounded-xl backdrop-blur-md border transition-colors ${inComp ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-950/80 text-slate-300 border-emerald-900/60 hover:text-emerald-400'}`}
                          title="Compare"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Product Image */}
                      <div 
                        onClick={() => navigateToProduct(p.handle)}
                        className="w-full h-48 bg-[#030e07] rounded-xl overflow-hidden mb-4 cursor-pointer relative flex items-center justify-center p-2"
                      >
                        <img
                          src={p.featuredImage?.url || "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80"}
                          alt={p.featuredImage?.altText || p.title}
                          className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Brand & Category */}
                      <div className="text-[11px] text-slate-400 font-mono mb-1 flex items-center justify-between">
                        <span>{p.vendor}</span>
                        <span className="text-emerald-400/80">{p.productType}</span>
                      </div>

                      {/* Product Title */}
                      <h4 
                        onClick={() => navigateToProduct(p.handle)}
                        className="font-bold text-slate-100 text-sm hover:text-emerald-400 transition-colors line-clamp-2 cursor-pointer mb-2 flex-1"
                      >
                        {p.title}
                      </h4>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono ml-1">(4.9)</span>
                      </div>

                      {/* Price & Add to Cart Row */}
                      <div className="pt-3 border-t border-emerald-900/40 flex items-center justify-between gap-2 mt-auto">
                        <div>
                          <div className="font-mono font-bold text-emerald-400 text-sm">
                            {formatMoney(minPrice)}
                          </div>
                          {comparePrice && (
                            <div className="font-mono text-[10px] text-slate-500 line-through">
                              {formatMoney(comparePrice)}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(p)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs shadow-lg shadow-emerald-950/40 active:scale-95"
                          title="Add to Cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Add</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List Mode */
              <div className="space-y-4">
                {filteredProducts.map((p) => {
                  const minPrice = p.priceRange.minVariantPrice.amount;
                  const comparePrice = p.compareAtPriceRange?.minVariantPrice?.amount;

                  return (
                    <div
                      key={p.id}
                      className="bg-[#05140b] border border-emerald-900/40 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-300 flex flex-col sm:flex-row items-center gap-6"
                    >
                      <div 
                        onClick={() => navigateToProduct(p.handle)}
                        className="w-full sm:w-44 h-36 bg-[#030e07] rounded-xl overflow-hidden shrink-0 cursor-pointer p-2 flex items-center justify-center"
                      >
                        <img
                          src={p.featuredImage?.url || "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80"}
                          alt={p.title}
                          className="max-h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 space-y-2 text-left w-full">
                        <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                          <span>{p.vendor}</span>
                          <span>•</span>
                          <span>{p.productType}</span>
                        </div>
                        <h4 
                          onClick={() => navigateToProduct(p.handle)}
                          className="font-bold text-slate-100 text-base hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {p.description || "High-performance gaming hardware with precision engineered components and low-latency response times."}
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                          <span className="text-base font-mono font-bold text-emerald-400">{formatMoney(minPrice)}</span>
                          {comparePrice && <span className="text-xs font-mono text-slate-500 line-through">{formatMoney(comparePrice)}</span>}
                        </div>
                      </div>

                      <div className="shrink-0 flex sm:flex-col gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => addToCart(p)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" /> Add to Cart
                        </button>
                        <button
                          onClick={() => setQuickViewHandle(p.handle)}
                          className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-medium hover:bg-emerald-900/60 transition-colors"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
};
