import React from "react";
import { Instagram, ExternalLink, Heart } from "lucide-react";

const INSTAGRAM_POSTS = [
  {
    title: "Minimalist IEM Setup",
    likes: "1.8k",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    url: "https://www.instagram.com/therevivetech/",
  },
  {
    title: "Nanoleaf & Edifier Battlestation",
    likes: "2.4k",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    url: "https://www.instagram.com/therevivetech/",
  },
  {
    title: "EasySMX Wireless Controller Rig",
    likes: "3.1k",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
    url: "https://www.instagram.com/therevivetech/",
  },
  {
    title: "Govee Ambient RGB Studio",
    likes: "2.9k",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    url: "https://www.instagram.com/therevivetech/",
  },
];

export const CommunityStories: React.FC = () => {
  return (
    <section className="py-14 bg-slate-950/90 border-b border-emerald-900/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-emerald-900/40">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800/40 inline-flex items-center gap-1.5 mb-1.5">
              <Instagram className="w-3.5 h-3.5" /> @THEREVIVETECH
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Community Setup Gallery
            </h2>
          </div>

          <a
            href="https://www.instagram.com/therevivetech/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white font-mono font-bold text-xs uppercase px-4 py-2.5 rounded-xl shadow-lg transition-all w-fit"
          >
            <Instagram className="w-4 h-4" /> Follow Us on Instagram
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INSTAGRAM_POSTS.map((post, idx) => (
            <a
              key={idx}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative h-72 rounded-2xl overflow-hidden border border-emerald-900/40 bg-slate-900 block hover:border-emerald-500/60 transition-all shadow-md"
            >
              <img
                src={post.image}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md p-2 rounded-full border border-emerald-500/30 text-rose-400 group-hover:scale-110 transition-transform">
                <Instagram className="w-4 h-4 text-pink-400" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end">
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">@therevivetech</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono text-rose-300 font-bold bg-slate-950/90 px-2 py-0.5 rounded border border-rose-900/40">
                  <Heart className="w-3 h-3 fill-rose-400" /> {post.likes}
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};
