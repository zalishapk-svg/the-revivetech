import React from "react";
import { BookOpen, Calendar, User, ArrowLeft, ArrowRight } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

interface BlogPageProps {
  articleHandle?: string;
}

export const BlogPage: React.FC<BlogPageProps> = ({ articleHandle }) => {
  const { articles, navigateToBlogArticle, navigateToBlog, navigateToHome } = useShopify();

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
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.publishedAt}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {article.authorV2?.name || "TheReviveTech Lab"}</span>
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
            <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#030e07] text-slate-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="bg-[#071910] border border-emerald-800/50 p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <BookOpen className="w-4 h-4" /> LIVE SHOPIFY BLOG API ({articles.length} ARTICLES)
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">TheReviveTech Blogs</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2">
            Deep dive engineering articles, hardware benchmark reports, firmware changelogs, and esports gear tuning guides.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => navigateToBlogArticle(art.handle)}
              className="bg-[#071910] border border-emerald-900/40 rounded-3xl overflow-hidden cursor-pointer group hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div className="aspect-video bg-slate-900 overflow-hidden">
                {art.image && (
                  <img
                    src={art.image.url}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-emerald-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {art.publishedAt}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {art.authorV2?.name || "TheReviveTech Lab"}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mt-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mt-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 pt-2 border-t border-emerald-950">
                  Read Full Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
