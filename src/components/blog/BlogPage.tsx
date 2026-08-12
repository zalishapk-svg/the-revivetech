import React, { useState, useMemo } from "react";
import { BookOpen, Calendar, ArrowRight, Search } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { SingleBlogPostPage } from "./SingleBlogPostPage";
import { BlogSidebar } from "./BlogSidebar";

interface BlogPageProps {
  articleHandle?: string;
}

export const BlogPage: React.FC<BlogPageProps> = ({ articleHandle }) => {
  const { 
    articles, isLoadingData, navigateToArticle, showToast,
    hasMoreArticles, isFetchingMoreArticles, fetchMoreArticles, fetchAllArticles
  } = useShopify();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // Automatically fetch remaining blog articles from Shopify when blog page is active
  React.useEffect(() => {
    if (hasMoreArticles && !isFetchingMoreArticles) {
      fetchAllArticles();
    }
  }, [hasMoreArticles, isFetchingMoreArticles]);

  const postsPerPage = 9;

  // If articleHandle is supplied, delegate directly to SingleBlogPostPage
  if (articleHandle) {
    return <SingleBlogPostPage handle={articleHandle} />;
  }

  // Extract unique tags from loaded articles
  const allTags = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      a.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [articles]);

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

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredArticles.slice(start, start + postsPerPage);
  }, [filteredArticles, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      showToast("Thank you for subscribing to TheReviveTech Journal!");
      setNewsletterEmail("");
    }
  };

  return (
    <div className="bg-[#030e07] text-slate-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Blog Banner Header */}
        <div className="bg-gradient-to-r from-[#071910] via-[#04140b] to-[#020b05] border border-emerald-800/60 p-8 sm:p-12 rounded-3xl relative overflow-hidden shadow-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>TheReviveTech Hardware Journal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Esports Benchmarks & Tech Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            In-depth low-latency hardware analysis, mechanical switch lubrication guides, custom audio profile teardowns, and gaming gear engineering insights.
          </p>
        </div>

        {/* 2-Column Main Layout: Sidebar (1 col) + Articles (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Redesigned Responsive Sidebar */}
          <aside className="lg:col-span-1 lg:sticky lg:top-24">
            <BlogSidebar
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
              selectedTag={selectedTag}
              onTagSelect={(t) => {
                setSelectedTag(t);
                setCurrentPage(1);
              }}
            />
          </aside>

          {/* Main Articles Grid */}
          <main className="lg:col-span-3 space-y-8">
            
            {/* Loading Skeleton */}
            {isLoadingData && articles.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-[#071910] border border-emerald-900/40 rounded-3xl p-4 space-y-4 animate-pulse">
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
              <div className="bg-[#071910] border border-emerald-900/40 rounded-3xl p-12 text-center space-y-3">
                <Search className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Articles Found</h3>
                <p className="text-xs text-slate-400">Try clearing your search query or choosing another topic filter.</p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedTag("all"); }}
                  className="bg-emerald-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => navigateToArticle(art.handle)}
                    className="bg-[#071910] border border-emerald-900/50 rounded-3xl overflow-hidden cursor-pointer group hover:border-emerald-500 transition-all shadow-xl flex flex-col justify-between"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-8 border-t border-emerald-900/40 flex items-center justify-center gap-2 flex-wrap">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  className="px-4 py-2 rounded-xl bg-[#071910] border border-emerald-900/60 text-xs font-mono font-bold text-slate-300 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
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
                        : "bg-[#071910] border border-emerald-900/60 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-4 py-2 rounded-xl bg-[#071910] border border-emerald-900/60 text-xs font-mono font-bold text-slate-300 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
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
