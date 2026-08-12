import React, { useState } from "react";
import { Search, BookOpen, Sparkles, Send, ChevronRight, Filter, Tag } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

interface BlogSidebarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedTag?: string;
  onTagSelect?: (tag: string) => void;
  className?: string;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  searchQuery = "",
  onSearchChange,
  selectedTag = "all",
  onTagSelect,
  className = "",
}) => {
  const { articles, navigateToArticle, showToast } = useShopify();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get recent 5 articles only
  const recentArticles = articles.slice(0, 5);

  // Extract top 6 tags
  const topTags = React.useMemo(() => {
    const map = new Map<string, number>();
    articles.forEach((a) => {
      a.tags?.forEach((t) => {
        map.set(t, (map.get(t) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [articles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(localSearch);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      showToast("Thank you for subscribing to TheReviveTech Journal!");
      setNewsletterEmail("");
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="w-full bg-[#071910] border border-emerald-900/60 p-3.5 rounded-2xl text-xs font-mono font-bold text-emerald-400 flex items-center justify-between hover:bg-emerald-950/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>{isMobileOpen ? "Hide Blog Sidebar & Search" : "Show Blog Sidebar & Search"}</span>
          </span>
          <ChevronRight className={`w-4 h-4 transition-transform ${isMobileOpen ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Main Sidebar Container (Always visible on desktop, toggleable on mobile) */}
      <div
        className={`${
          isMobileOpen ? "block" : "hidden lg:block"
        } bg-[#071910] border border-emerald-900/50 rounded-3xl p-6 shadow-xl space-y-6`}
      >
        {/* 1. Search Box */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
            Search Articles
          </label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              placeholder="Search guide, review..."
              className="w-full bg-[#030e07] border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </form>
        </div>

        {/* 2. Categories / Topics (Concise) */}
        {topTags.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-emerald-900/40">
            <label className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
              Categories
            </label>
            <div className="space-y-1">
              <button
                onClick={() => onTagSelect && onTagSelect("all")}
                className={`w-full text-left text-xs px-3 py-2 rounded-xl font-mono transition-colors flex items-center justify-between ${
                  selectedTag === "all"
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                    : "text-slate-300 hover:bg-emerald-950/60"
                }`}
              >
                <span>All Articles</span>
                <span className="text-[10px] opacity-80">{articles.length}</span>
              </button>
              {topTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagSelect && onTagSelect(tag)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl font-mono transition-colors flex items-center justify-between ${
                    selectedTag === tag
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                      : "text-slate-300 hover:bg-emerald-950/60"
                  }`}
                >
                  <span>{tag}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Recent Posts (Strictly limited to 5) */}
        <div className="pt-2 border-t border-emerald-900/40 space-y-3">
          <label className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
            Recent Posts
          </label>
          <div className="space-y-2.5">
            {recentArticles.map((art) => (
              <button
                key={art.id}
                onClick={() => navigateToArticle(art.handle)}
                className="w-full text-left flex gap-3 items-center group p-1.5 rounded-xl hover:bg-emerald-950/60 transition-colors"
              >
                {art.image ? (
                  <img
                    src={art.image.url}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover shrink-0 border border-emerald-800/40 group-hover:border-emerald-500/60"
                  />
                ) : (
                  <div className="w-11 h-11 bg-emerald-950 rounded-lg shrink-0 flex items-center justify-center text-emerald-500 border border-emerald-800/40">
                    <BookOpen className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : "Recent"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Tags Chips */}
        {topTags.length > 0 && (
          <div className="pt-2 border-t border-emerald-900/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              <Tag className="w-3.5 h-3.5" /> Popular Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topTags.map((t) => (
                <button
                  key={t}
                  onClick={() => onTagSelect && onTagSelect(t)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                    selectedTag === t
                      ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400"
                      : "bg-[#030e07] text-slate-300 border-emerald-900/60 hover:border-emerald-500/60"
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Newsletter Card */}
        <div className="pt-2 border-t border-emerald-900/40 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" /> Hardware Newsletter
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Weekly esports benchmarks, low-latency firmware guides, and gear drops.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Your gaming email..."
              required
              className="w-full bg-[#030e07] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <Send className="w-3 h-3" /> Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
