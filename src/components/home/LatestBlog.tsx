import React from "react";
import { ArrowRight, Calendar, User } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const LatestBlog: React.FC = () => {
  const { articles, navigateToBlogArticle, navigateToBlog } = useShopify();

  return (
    <section className="py-16 bg-[#030e07] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              JOURNAL & ANNOUNCEMENTS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Latest Technology Journal
            </h2>
          </div>
          <button onClick={navigateToBlog} className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
            View Journal <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => navigateToBlogArticle(art.handle)}
              className="bg-[#071910] border border-emerald-900/40 rounded-2xl overflow-hidden cursor-pointer group hover:border-emerald-500/50 transition-all flex flex-col justify-between"
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
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-emerald-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {art.publishedAt}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {art.authorV2?.name || "TheReviveTech Lab"}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors mt-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
