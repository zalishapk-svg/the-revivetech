import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar, User, Clock, ArrowLeft, Share2, Twitter, Facebook, Linkedin, 
  Copy, Check, ChevronRight, BookOpen, Tag, Sparkles, Send, ArrowRight, List
} from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { getBlogArticleByHandleFromShopify } from "../../lib/shopify";
import { BlogArticle } from "../../types";
import { BlogSidebar } from "./BlogSidebar";

interface SingleBlogPostPageProps {
  handle: string;
}

export const SingleBlogPostPage: React.FC<SingleBlogPostPageProps> = ({ handle }) => {
  const { articles, navigateToBlog, navigateToArticle, navigateToHome, showToast } = useShopify();
  
  const [article, setArticle] = useState<BlogArticle | null>(() => {
    return articles.find((a) => a.handle === handle) || null;
  });
  const [loading, setLoading] = useState<boolean>(!article);
  const [copied, setCopied] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // Fetch article data if not in context
  useEffect(() => {
    let isMounted = true;
    const existing = articles.find((a) => a.handle === handle);
    if (existing) {
      setArticle(existing);
      setLoading(false);
    } else {
      setLoading(true);
      getBlogArticleByHandleFromShopify(handle).then((res) => {
        if (isMounted) {
          setArticle(res);
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [handle, articles]);

  // Extract Table of Contents from HTML
  const tocItems = useMemo(() => {
    if (!article?.contentHtml) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.contentHtml, "text/html");
    const headings = Array.from(doc.querySelectorAll("h2, h3"));
    return headings.map((h, i) => ({
      id: `heading-${i}`,
      text: h.textContent || "",
      level: h.tagName.toLowerCase(),
    }));
  }, [article]);

  // Transform contentHtml to add IDs to headings for smooth scrolling
  const processedContentHtml = useMemo(() => {
    if (!article?.contentHtml) return article?.content || "";
    let html = article.contentHtml;
    let headingCounter = 0;
    html = html.replace(/<(h[23])(.*?)>(.*?)<\/\1>/gi, (_match, tag, attrs, text) => {
      const id = `heading-${headingCounter++}`;
      return `<${tag} id="${id}" ${attrs} class="scroll-mt-24 text-white font-bold my-6 ${tag === "h2" ? "text-2xl border-b border-emerald-900/60 pb-2" : "text-xl"}">${text}</${tag}>`;
    });
    return html;
  }, [article]);

  // Calculate reading time
  const readingTime = useMemo(() => {
    if (article?.readingTimeMinutes) return article.readingTimeMinutes;
    const text = article?.content || article?.excerpt || "";
    const words = text.split(/\s+/).length;
    return Math.max(3, Math.ceil(words / 200));
  }, [article]);

  // Find index for Prev / Next links
  const currentIndex = useMemo(() => {
    return articles.findIndex((a) => a.handle === handle);
  }, [articles, handle]);

  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  // Related Articles (excluding current)
  const relatedArticles = useMemo(() => {
    return articles
      .filter((a) => a.handle !== handle)
      .slice(0, 3);
  }, [articles, handle]);

  // Recent articles for sidebar (top 5)
  const recentArticles = useMemo(() => {
    return articles.slice(0, 5);
  }, [articles]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      showToast("Thank you for subscribing to TheReviveTech Journal!");
      setNewsletterEmail("");
    }
  };

  // Inject SEO metadata
  useEffect(() => {
    if (article) {
      document.title = `${article.title} | The Revive Tech Journal`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", article.excerpt || article.title);

      // Add Open Graph JSON-LD Schema
      const scriptId = "jsonld-article";
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": article.title,
        "description": article.excerpt,
        "image": article.image?.url,
        "datePublished": article.publishedAt,
        "author": {
          "@type": "Person",
          "name": article.author || "TheReviveTech Editorial",
        },
        "publisher": {
          "@type": "Organization",
          "name": "The Revive Tech",
          "logo": {
            "@type": "ImageObject",
            "url": "https://therevivetech.pk/logo.png",
          },
        },
      });
    }
  }, [article]);

  if (loading) {
    return (
      <div className="bg-[#030e07] text-slate-100 min-h-screen py-16">
        <div className="max-w-5xl mx-auto px-4 space-y-8 animate-pulse">
          <div className="h-4 w-32 bg-emerald-950/60 rounded" />
          <div className="h-12 w-3/4 bg-emerald-950/80 rounded-2xl" />
          <div className="h-6 w-1/2 bg-emerald-950/50 rounded-xl" />
          <div className="w-full aspect-video bg-emerald-950/60 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-emerald-950/40 rounded" />
            <div className="h-4 w-5/6 bg-emerald-950/40 rounded" />
            <div className="h-4 w-4/6 bg-emerald-950/40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="bg-[#030e07] text-slate-100 min-h-screen py-20 flex items-center justify-center">
        <div className="text-center space-y-4 bg-[#071910] border border-emerald-900/60 p-12 rounded-3xl max-w-md mx-auto shadow-2xl">
          <BookOpen className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-black text-white">Article Not Found</h2>
          <p className="text-xs text-slate-400">The requested blog post could not be retrieved from Shopify Storefront.</p>
          <button
            onClick={navigateToBlog}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tech Journal
          </button>
        </div>
      </div>
    );
  }

  const category = article.tags && article.tags.length > 0 ? article.tags[0] : "Hardware Review";

  return (
    <article className="bg-[#030e07] text-slate-100 min-h-screen py-10 selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 overflow-x-auto pb-2 border-b border-emerald-900/40">
          <button onClick={navigateToHome} className="hover:text-emerald-400 transition-colors">Home</button>
          <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
          <button onClick={navigateToBlog} className="hover:text-emerald-400 transition-colors">Blog</button>
          <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="text-emerald-400 font-bold truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
        </nav>

        {/* Back Button */}
        <div>
          <button
            onClick={navigateToBlog}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-800/60 transition-all hover:border-emerald-500"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </button>
        </div>

        {/* Hero Article Header */}
        <header className="space-y-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-full font-black uppercase tracking-wider text-[11px] shadow-md">
              {category}
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Recent"}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {readingTime} min read
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              {article.author || "TheReviveTech Lab"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed border-l-2 border-emerald-500 pl-4 py-1">
              {article.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {article.image && (
          <div className="rounded-3xl overflow-hidden bg-slate-900 border border-emerald-800/60 aspect-video shadow-2xl relative group">
            <img 
              src={article.image.url} 
              alt={article.image.altText || article.title} 
              referrerPolicy="no-referrer" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030e07] via-transparent to-transparent opacity-60" />
          </div>
        )}

        {/* 2-Column Main Editorial Layout: Content + TOC Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Article Content (8 cols) */}
          <main className="lg:col-span-8 space-y-10">
            
            {/* Rich Text Editorial Body */}
            <div className="bg-[#071910] border border-emerald-900/50 p-6 sm:p-10 rounded-3xl text-slate-200 text-base sm:text-lg leading-relaxed shadow-xl space-y-6">
              <div 
                className="blog-content prose prose-invert prose-emerald max-w-none prose-p:leading-relaxed prose-p:text-slate-300 prose-headings:text-white prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-950/40 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-li:text-slate-300"
                dangerouslySetInnerHTML={{ __html: processedContentHtml }}
              />
            </div>

            {/* Social Sharing & Tags */}
            <div className="bg-[#071910] border border-emerald-900/40 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">Topics:</span>
                <div className="flex flex-wrap gap-1.5">
                  {article.tags?.map((t) => (
                    <span key={t} className="bg-emerald-950 text-emerald-300 text-[11px] font-mono px-2.5 py-0.5 rounded-md border border-emerald-800/60">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sharing Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase mr-1">Share:</span>
                <button 
                  onClick={handleCopyLink}
                  title="Copy Article Link"
                  className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Author Profile Box */}
            <div className="bg-[#071910] border border-emerald-900/50 p-6 rounded-3xl flex items-center gap-5 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-slate-950 font-black text-2xl shrink-0 shadow-md">
                {(article.author || "TR")[0]}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-widest font-bold">Written By</span>
                <h4 className="text-lg font-black text-white">{article.author || "TheReviveTech Lab"}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hardware Engineer & Esports Gear Specialist at The Revive Tech. Dedicated to low-latency benchmarking, custom switch acoustics, and thermal analysis.
                </p>
              </div>
            </div>

            {/* Prev / Next Article Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {prevArticle ? (
                <button
                  onClick={() => navigateToArticle(prevArticle.handle)}
                  className="bg-[#071910] border border-emerald-900/50 p-4 rounded-2xl text-left hover:border-emerald-500 transition-all group space-y-1"
                >
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Previous Article
                  </span>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300 line-clamp-1">
                    {prevArticle.title}
                  </p>
                </button>
              ) : <div />}

              {nextArticle && (
                <button
                  onClick={() => navigateToArticle(nextArticle.handle)}
                  className="bg-[#071910] border border-emerald-900/50 p-4 rounded-2xl text-right hover:border-emerald-500 transition-all group space-y-1 ml-auto w-full"
                >
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center justify-end gap-1">
                    Next Article <ArrowRight className="w-3 h-3" />
                  </span>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300 line-clamp-1">
                    {nextArticle.title}
                  </p>
                </button>
              )}
            </div>

          </main>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Table of Contents */}
            {tocItems.length > 0 && (
              <div className="bg-[#071910] border border-emerald-900/50 rounded-3xl p-6 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-900/60 pb-2">
                  <List className="w-4 h-4 text-emerald-400" />
                  Table of Contents
                </div>
                <ul className="space-y-2 text-xs font-sans">
                  {tocItems.map((item) => (
                    <li key={item.id} className={item.level === "h3" ? "ml-3" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 line-clamp-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{item.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Redesigned Compact Blog Sidebar */}
            <BlogSidebar
              onSearchChange={(q) => {
                navigateToBlog();
              }}
              onTagSelect={(t) => {
                navigateToBlog();
              }}
            />

          </aside>

        </div>

        {/* Bottom Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="pt-10 border-t border-emerald-900/40 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Recommended Reads</span>
                <h3 className="text-2xl font-black text-white">Related Tech Articles</h3>
              </div>
              <button onClick={navigateToBlog} className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                View All Articles <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigateToArticle(rel.handle)}
                  className="bg-[#071910] border border-emerald-900/50 rounded-2xl overflow-hidden hover:border-emerald-500 transition-all group cursor-pointer shadow-xl flex flex-col"
                >
                  <div className="aspect-video bg-slate-900 overflow-hidden relative">
                    {rel.image ? (
                      <img src={rel.image.url} alt={rel.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-emerald-950 flex items-center justify-center text-emerald-500">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                        {rel.tags && rel.tags[0] ? rel.tags[0] : "Hardware"}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block pt-2 border-t border-emerald-900/40">
                      {rel.publishedAt ? new Date(rel.publishedAt).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </article>
  );
};
