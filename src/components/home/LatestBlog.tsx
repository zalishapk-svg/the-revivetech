import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Calendar, User, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const LatestBlog: React.FC = () => {
  const { articles, navigateToArticle, navigateToBlog } = useShopify();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Manual navigation only (auto-scroll disabled per user requirement)
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -340 : 340, behavior: "smooth" });
    }
  };

  if (!articles || articles.length === 0) return null;

  return (
    <section
      className="py-14 bg-[#161616] border-b border-emerald-900/30 text-slate-100 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-emerald-900/40">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800/40 inline-flex items-center gap-1.5 mb-1.5">
              <BookOpen className="w-3.5 h-3.5" /> RECENT ARTICLES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Blogs
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tech guides, setup reviews, and industry insights from our gaming lab.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={navigateToBlog}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 hover:underline focus:outline-none"
            >
              View All Blogs ({articles.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <button
                onClick={() => scroll("left")}
                aria-label="Previous articles"
                className="p-2 rounded-lg bg-[#1c1c1c] hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Next articles"
                className="p-2 rounded-lg bg-[#1c1c1c] hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-emerald-900/40 transition-colors focus:outline-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Track */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-none select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => navigateToArticle(art.handle)}
              className="min-w-[280px] sm:min-w-[340px] max-w-[360px] bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl overflow-hidden cursor-pointer group/blogcard hover:border-emerald-500/60 transition-all flex flex-col justify-between"
            >
              <div className="aspect-video bg-[#161616] overflow-hidden relative">
                {art.image ? (
                  <img
                    src={art.image.url}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover/blogcard:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
                    The Revive Tech
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-emerald-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : "Recent"}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {art.author || "TheReviveTech"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover/blogcard:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {art.excerpt || art.content?.slice(0, 100)}
                  </p>
                </div>

                <span className="text-xs font-bold font-mono text-emerald-400 group-hover/blogcard:translate-x-1 transition-transform flex items-center gap-1 pt-2 border-t border-slate-800/60">
                  Read More <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
