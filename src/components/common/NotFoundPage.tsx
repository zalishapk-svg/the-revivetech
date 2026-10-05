import React from "react";
import { useShopify } from "../../context/ShopifyContext";
import {
  Compass,
  ArrowLeft,
  Search,
  Keyboard,
  Mouse,
  Headphones,
  SlidersHorizontal,
  Home,
  MessageCircle,
} from "lucide-react";

interface NotFoundPageProps {
  requestedPath?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ requestedPath }) => {
  const { navigateToHome, navigateToShop, navigateToCollection, navigateToSearch } = useShopify();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateToSearch(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-[75vh] bg-[#161616] text-slate-100 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full text-center space-y-10">
        {/* Glow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C0FE2D]/10 border border-[#C0FE2D]/30 text-[#C0FE2D] text-xs font-mono font-bold tracking-widest uppercase">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} />
          <span>Error 404 — Hardware Route Not Found</span>
        </div>

        {/* Hero Code & Heading */}
        <div className="space-y-4">
          <h1 className="text-7xl sm:text-9xl font-black tracking-tighter text-white select-none">
            4<span className="text-[#C0FE2D]">0</span>4
          </h1>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Oops! This Gear Doesn't Exist
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            The page {requestedPath ? <code className="text-[#C0FE2D] bg-[#1f1f1f] px-2 py-0.5 rounded text-xs font-mono">{requestedPath}</code> : "you requested"} could not be found, may have been retired, or has been relocated to another category.
          </p>
        </div>

        {/* Interactive Search Bar */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keyboards, mice, headsets..."
              className="w-full bg-[#1c1c1c] border border-slate-800 rounded-2xl py-3.5 pl-4 pr-28 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C0FE2D] transition-colors font-sans"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-2 bg-[#C0FE2D] hover:bg-[#d4ff66] text-[#161616] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Quick Recovery Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigateToHome()}
            className="px-6 py-3 bg-[#C0FE2D] hover:bg-[#d4ff66] text-[#161616] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#C0FE2D]/10"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
          <button
            onClick={() => navigateToShop()}
            className="px-6 py-3 bg-[#242424] hover:bg-[#2e2e2e] text-white border border-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Explore All Hardware</span>
          </button>
        </div>

        {/* Popular Categories Shortcut Cards */}
        <div className="pt-6 border-t border-slate-800/80">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 font-bold">
            Popular Gaming Gear Categories
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <button
              onClick={() => navigateToCollection("keyboard")}
              className="p-3.5 bg-[#1b1b1b] hover:bg-[#222] border border-slate-800 hover:border-[#C0FE2D]/40 rounded-xl transition-all text-left group"
            >
              <Keyboard className="w-4 h-4 text-[#C0FE2D] mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white text-xs">Keyboards</div>
              <div className="text-[10px] text-slate-500 font-mono">Mechanical & Hall</div>
            </button>

            <button
              onClick={() => navigateToCollection("mouse")}
              className="p-3.5 bg-[#1b1b1b] hover:bg-[#222] border border-slate-800 hover:border-[#C0FE2D]/40 rounded-xl transition-all text-left group"
            >
              <Mouse className="w-4 h-4 text-[#C0FE2D] mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white text-xs">Gaming Mice</div>
              <div className="text-[10px] text-slate-500 font-mono">8000Hz & Wireless</div>
            </button>

            <button
              onClick={() => navigateToCollection("headsets")}
              className="p-3.5 bg-[#1b1b1b] hover:bg-[#222] border border-slate-800 hover:border-[#C0FE2D]/40 rounded-xl transition-all text-left group"
            >
              <Headphones className="w-4 h-4 text-[#C0FE2D] mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white text-xs">Audio & Headsets</div>
              <div className="text-[10px] text-slate-500 font-mono">Spatial Sound</div>
            </button>

            <button
              onClick={() => navigateToCollection("iems")}
              className="p-3.5 bg-[#1b1b1b] hover:bg-[#222] border border-slate-800 hover:border-[#C0FE2D]/40 rounded-xl transition-all text-left group"
            >
              <Compass className="w-4 h-4 text-[#C0FE2D] mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white text-xs">IEMs & Audio</div>
              <div className="text-[10px] text-slate-500 font-mono">Hi-Res In-Ear</div>
            </button>
          </div>
        </div>

        {/* Live Support Help */}
        <div className="pt-2 text-xs text-slate-500 flex items-center justify-center gap-2">
          <span>Need help finding a specific product?</span>
          <a
            href="https://wa.me/923475799958"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C0FE2D] hover:underline font-bold inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp Support: 0347 5799958
          </a>
        </div>
      </div>
    </div>
  );
};
