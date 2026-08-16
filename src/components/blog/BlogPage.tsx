import React, { useState, useMemo, useEffect } from "react";
import { BookOpen, Calendar, ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { SingleBlogPostPage } from "./SingleBlogPostPage";
import { BlogSidebar } from "./BlogSidebar";
import { OffCanvasDrawer } from "../common/OffCanvasDrawer";

interface BlogPageProps {
  articleHandle?: string;
}

export const BlogPage: React.FC<BlogPageProps> = ({ articleHandle }) => {
  const { 
    articles, isLoadingData, navigateToArticle, showToast,
    hasMoreArticles, isFetchingMoreArticles, fetchAllArticles
  } = useShopify();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Initialize page number from URL search parameter ?page=N
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const p = parseInt(params.get("page") || "1", 10);
      return !isNaN(p) && p > 0 ? p : 1;
    }
    return 1;
  });

  // Keep page number in sync with URL search parameter
  useEffect(() => {
    const syncPageFromUrl = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const p = parseInt(params.get("page") || "1", 10);
      setCurrentPage(!isNaN(p) && p > 0 ? p : 1);
    };

    window.addEventListener("popstate", syncPageFromUrl);
    return () => window.removeEventListener("popstate", syncPageFromUrl);
  }, []);

  // Update URL search parameter when page changes
  const updatePageUrl = (newPage: number) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (newPage > 1) {
      url.searchParams.set("page", newPage.toString());
    } else {
      url.searchParams.delete("page");
    }
    window.history.pushState({ page: newPage }, "", url.toString());
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updatePageUrl(newPage);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  // Automatically fetch remaining blog articles from Shopify when blog page is active
  useEffect(() => {
    if (hasMoreArticles && !isFetchingMoreArticles) {
      fetchAllArticles();
    }
  }, [hasMoreArticles, isFetchingMoreArticles]);

  // Requirement: EXACTLY 12 posts per page
  const postsPerPage = 12;

  // If articleHandle is supplied, delegate directly to SingleBlogPostPage
  if (articleHandle) {
    return <SingleBlogPostPage handle={articleHandle} />;
  }

  // Filter articles based on query and topic tag
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchExcerpt = a.excerpt.toLowerCase().includes(q);
        const matchTag = a.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchExcerpt && !matchTag) return false;
      }
      if (selectedTag !== "all") {
        if (!a.tags?.includes(selectedTag)) return false;
      }
      return true;
    });
  }, [articles, searchQuery, selectedTag]);

  const totalPages = Math.ceil(filteredArticles.length / postsPerPage) || 1;

  // Only render the 12 posts belonging to the current page
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredArticles.slice(start, start + postsPerPage);
  }, [filteredArticles, currentPage, postsPerPage]);

  return (
    <div className="bg-[#161616] text-slate-100 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Blog Banner Header */}
        <div className="bg-[#1c1c1c] border border-emerald-800/60 p-6 sm:p-12 rounded-3xl relative overflow-hidden shadow-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>TheReviveTech Hardware Journal</span>
          </div>
          <h1 className="text-2xl sm:text-5xl font-black text-white tracking-tight">
            Esports Benchmarks & Tech Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            In-depth low-latency hardware analysis, mechanical switch lubrication guides, custom audio profile teardowns, and gaming gear engineering insights.
          </p>
        </div>

        {/* Mobile Filter & Search Trigger Button */}
        <div className="lg:hidden flex items-center justify-between bg-[#1c1c1c] border border-emerald-900/60 p-3.5 rounded-2xl">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter & Categories</span>
          </button>
          <span className="text-xs font-mono text-emerald-400">
            {filteredArticles.length} {filteredArticles.length === 1 ? "Article" : "Articles"} (Page {currentPage} of {totalPages})
          </span>
        </div>

        {/* 2-Column Main Layout: Sidebar (1 col) + Articles (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 bg-[#1c1c1c] border border-emerald-900/50 rounded-3xl p-6 shadow-xl">
            <BlogSidebar
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                handlePageChange(1);
              }}
              selectedTag={selectedTag}
              onTagSelect={(t) => {
                setSelectedTag(t);
                handlePageChange(1);
              }}
            />
          </aside>

          {/* Off-Canvas Drawer for Mobile/Tablet */}
          <OffCanvasDrawer
            isOpen={isMobileDrawerOpen}
            onClose={() => setIsMobileDrawerOpen(false)}
            title="Blog Search & Categories"
          >
            <BlogSidebar
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                handlePageChange(1);
              }}
              selectedTag={selectedTag}
              onTagSelect={(t) => {
                setSelectedTag(t);
                handlePageChange(1);
              }}
              onItemClick={() => setIsMobileDrawerOpen(false)}
            />
          </OffCanvasDrawer>

          {/* Main Articles Grid */}
          <main className="lg:col-span-3 space-y-8 w-full">
            
            {/* Loading Skeleton */}
            {isLoadingData && articles.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-4 space-y-4 animate-pulse">
                    <div className="aspect-video bg-emerald-950/60 rounded-2xl" />
                    <div className="space-y-2">
                      <div className="h-3 w-1/3 bg-emerald-950/50 rounded" />
                      <div className="h-5 w-5/6 bg-emerald-950/70 rounded" />
                      <div className="h-3 w-full bg-emerald-950/40 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-12 text-center space-y-3">
                <Search className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Articles Found</h3>
                <p className="text-xs text-slate-400">Try clearing your search query or choosing another topic filter.</p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedTag("all"); handlePageChange(1); }}
                  className="bg-emerald-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => navigateToArticle(art.handle)}
                    className="bg-[#1c1c1c] border border-emerald-900/50 rounded-3xl overflow-hidden cursor-pointer group hover:border-emerald-500 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div className="aspect-video bg-slate-900 overflow-hidden relative">
                      {art.image ? (
                        <img
                          src={art.image.url}
                          alt={art.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-950 flex items-center justify-center text-emerald-500">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                          <Calendar className="w-3 h-3" />
                          <span>{art.publishedAt ? new Date(art.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug line-clamp-2">
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {art.excerpt}
                        </p>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 pt-2 border-t border-emerald-900/40">
                        Read Article <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 border-t border-emerald-900/40 flex items-center justify-center gap-2 flex-wrap">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  className="px-4 py-2 rounded-xl bg-[#1c1c1c] border border-emerald-900/60 text-xs font-mono font-bold text-slate-300 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20"
                        : "bg-[#1c1c1c] border border-emerald-900/60 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  className="px-4 py-2 rounded-xl bg-[#1c1c1c] border border-emerald-900/60 text-xs font-mono font-bold text-slate-300 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
