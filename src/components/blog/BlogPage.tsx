import React, { useState, useMemo } from "react";
import { BookOpen, Calendar, User, ArrowLeft, ArrowRight, Search, Tag, Layers, ChevronRight } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

interface BlogPageProps {
  articleHandle?: string;
}

export const BlogPage: React.FC<BlogPageProps> = ({ articleHandle }) => {
  const { articles, navigateToBlogArticle, navigateToBlog, navigateToHome } = useShopify();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 15;

  // Extract tags from articles
  const allTags = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      a.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [articles]);

  // Filter articles
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
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  if (articleHandle) {
    const article = articles.find((a) => a.handle === articleHandle) || articles[0];

    return (
      <div className="bg-[#030e07] text-slate-100 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <button
            onClick={navigateToBlog}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blogs
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-mono text-emerald-400">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Recent"}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {article.authorV2?.name || article.author || "TheReviveTech Lab"}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">{article.title}</h1>
          </div>

          <div className="rounded-3xl overflow-hidden bg-slate-900 border border-emerald-800/50 aspect-video shadow-2xl">
            {article.image && (
              <img src={article.image.url} alt={article.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="bg-[#071910] border border-emerald-800/40 p-8 rounded-3xl text-sm sm:text-base text-slate-300 leading-relaxed space-y-4">
            <p className="font-semibold text-white text-lg">{article.excerpt}</p>
            <div dangerouslySetInnerHTML={{ __html: article.contentHtml || article.content }} />
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#030e07] text-slate-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Blog Banner */}
        <div className="bg-[#071910] border border-emerald-800/50 p-8 sm:p-12 rounded-3xl relative overflow-hidden shadow-2xl">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <BookOpen className="w-4 h-4" /> OFFICIAL TECH JOURNAL ({articles.length} ARTICLES)
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">TheReviveTech Lab Blogs</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2">
            Deep dive hardware benchmarks, custom mechanical keyboard modding guides, audio tuning techniques, and esports gear teardowns.
          </p>
        </div>

        {/* Main 2-Column Layout with Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Blog Sidebar */}
          <aside className="space-y-6 bg-[#071910] border border-emerald-900/40 rounded-3xl p-6 shadow-xl lg:sticky lg:top-24 lg:z-20">
            {/* Search */}
            <div>
              <label className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                Search Articles
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keywords, specs, guide..."
                  className="w-full bg-[#030e07] border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Filter by Tag / Topic */}
            <div>
              <label className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                Filter Topics
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedTag("all")}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl font-mono transition-colors flex items-center justify-between ${
                    selectedTag === "all" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-300 hover:bg-emerald-950/60"
                  }`}
                >
                  <span>All Articles</span>
                  <span className="text-[10px] opacity-80">{articles.length}</span>
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl font-mono transition-colors flex items-center justify-between ${
                      selectedTag === tag ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-300 hover:bg-emerald-950/60"
                    }`}
                  >
                    <span>{tag}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Posts Widget */}
            <div className="pt-4 border-t border-emerald-900/40">
              <label className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-3">
                Latest Entries
              </label>
              <div className="space-y-3">
                {articles.slice(0, 4).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => navigateToBlogArticle(art.handle)}
                    className="flex gap-3 items-center cursor-pointer group"
                  >
                    <div className="w-14 h-12 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-emerald-900/40">
                      {art.image && (
                        <img src={art.image.url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {art.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                        {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Posts Grid */}
          <main className="lg:col-span-3 space-y-8">
            {filteredArticles.length === 0 ? (
              <div className="bg-[#071910] border border-emerald-900/40 rounded-3xl p-12 text-center">
                <Search className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Articles Found</h3>
                <p className="text-xs text-slate-400 mb-4">Try clearing your search keyword or switching topic filters.</p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedTag("all"); }}
                  className="bg-emerald-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => navigateToBlogArticle(art.handle)}
                    className="bg-[#071910] border border-emerald-900/40 rounded-3xl overflow-hidden cursor-pointer group/card hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="aspect-video bg-slate-900 overflow-hidden">
                      {art.image && (
                        <img
                          src={art.image.url}
                          alt={art.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-emerald-400 mb-1.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : "Recent"}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover/card:text-emerald-300 transition-colors leading-snug line-clamp-2">
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {art.excerpt}
                        </p>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400 group-hover/card:translate-x-1 transition-transform flex items-center gap-1 pt-2 border-t border-emerald-950">
                        Read Full Article <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Blog Pagination Controls */}
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
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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
