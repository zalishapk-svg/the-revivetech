import React from "react";
import { YellowTape } from "../common/YellowTape";
import { useShopify } from "../../context/ShopifyContext";
import { 
  ShieldCheck, Award, Zap, Cpu, Trophy, Clock, Target, 
  Sparkles, CheckCircle2, ArrowRight, MapPin, Truck, Headphones
} from "lucide-react";

export const AboutPage: React.FC = () => {
  const { navigateToShop, navigateToContact } = useShopify();

  const timelineMilestones = [
    {
      year: "2019",
      title: "Founded in Lahore",
      desc: "ThereReviveTech was established with a singular vision: bringing authentic enthusiast-grade PC hardware, custom mechanical keyboards, and low-latency peripherals to gamers and creators across Pakistan.",
      badge: "Inception"
    },
    {
      year: "2021",
      title: "Direct Brand Partnerships",
      desc: "Secured official authorization with top global peripheral manufacturers, establishing direct import pipelines and eliminating counterfeit hardware risk for Pakistani enthusiasts.",
      badge: "Authorization"
    },
    {
      year: "2023",
      title: "Nationwide Fulfillment Hubs",
      desc: "Expanded express shipping facilities to Karachi, Islamabad, and Lahore, enabling same-day delivery in major metros and 48-hour tracked delivery across 200+ cities in Pakistan.",
      badge: "Expansion"
    },
    {
      year: "2026",
      title: "Built for Modern Tech",
      desc: "We continue to grow with one simple goal: making quality technology, computer hardware, gaming essentials, and everyday tech easier to discover and purchase. From carefully selected products to a smooth shopping experience, we're focused on bringing reliable technology closer to our customers.",
      badge: "Our Next Chapter"
    }
  ];

  const stats = [
    { value: "50,000+", label: "Gamers & Creators Served in PK" },
    { value: "100%", label: "Genuine Authorized Hardware" },
    { value: "Verified", label: "Official Brand Warranties" },
    { value: "4.9 / 5.0", label: "Customer Satisfaction Score" }
  ];

  return (
    <div className="w-full bg-[#161616] text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto pt-6 space-y-4">
          <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60 inline-block">
            Our Brand Story
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            REVIVING TECHNOLOGY FOR <YellowTape text="PEAK BATTLESTATIONS" />
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            ThereReviveTech is Pakistan's premier destination for genuine, high-performance PC peripherals, custom mechanical keyboards, and audiophile gear. We build and supply hardware designed to win.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-8 shadow-2xl">
          {stats.map((s, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">{s.value}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Story, Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-8 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Our Story</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Frustrated by counterfeit tech hardware and inflated grey-market prices in Pakistan, our team launched ThereReviveTech to establish a trustworthy, official supply chain for true technology enthusiasts.
            </p>
          </div>

          <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-8 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Brand Mission</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              To empower gamers, esports competitors, developers, and content creators with hardware that delivers competitive superiority, ergonomics, and longevity backed by transparent local support.
            </p>
          </div>

          <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-8 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Brand Vision</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              To become South Asia's premier gaming & technology destination—bringing official hardware, custom mechanical keyboards, and top-tier accessories directly to creators and gamers.
            </p>
          </div>
        </div>

        {/* Vertical Timeline */}
        <div className="space-y-8 bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">OUR JOURNEY & MILESTONES</h2>
            <p className="text-xs text-slate-400">How we evolved into Pakistan's top gaming hardware provider</p>
          </div>

          <div className="relative border-l-2 border-emerald-900/80 ml-4 md:ml-32 space-y-12 py-4">
            {timelineMilestones.map((m, idx) => (
              <div key={idx} className="relative pl-8 md:pl-12 group">
                {/* Year Marker on Left for Desktop */}
                <div className="hidden md:block absolute -left-32 top-0 text-right w-24 font-mono font-bold text-emerald-400 text-lg">
                  {m.year}
                </div>

                {/* Timeline Dot Marker */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#161616] border-2 border-emerald-500 group-hover:bg-emerald-400 group-hover:scale-125 transition-all" />

                <div className="bg-[#161616] border border-emerald-900/60 rounded-2xl p-6 hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="md:hidden text-emerald-400 font-mono font-bold text-sm">{m.year}</span>
                    <h4 className="text-lg font-bold text-white">{m.title}</h4>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-mono">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose ThereReviveTech */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">WHY GAMERS CHOOSE US</h2>
            <p className="text-xs text-slate-400">Built by enthusiasts, for enthusiasts</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl p-6 space-y-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <h4 className="font-bold text-white text-sm">Authentic Products</h4>
              <p className="text-xs text-slate-400">All products are 100% genuine original hardware with direct brand verification.</p>
            </div>

            <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl p-6 space-y-3">
              <Truck className="w-8 h-8 text-emerald-400" />
              <h4 className="font-bold text-white text-sm">Express Shipping in PK</h4>
              <p className="text-xs text-slate-400">Same-day delivery in Lahore & Karachi, 24-48 hours tracked shipping nationwide.</p>
            </div>

            <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl p-6 space-y-3">
              <Cpu className="w-8 h-8 text-emerald-400" />
              <h4 className="font-bold text-white text-sm">100% Genuine Hardware</h4>
              <p className="text-xs text-slate-400">Directly imported from authorized global brand hubs. Zero counterfeits guarantee.</p>
            </div>

            <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl p-6 space-y-3">
              <Headphones className="w-8 h-8 text-emerald-400" />
              <h4 className="font-bold text-white text-sm">24/7 Tech Support</h4>
              <p className="text-xs text-slate-400">Get expert advice on switch selection, sensor tuning, and compatibility from our team.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#1c1c1c] via-[#222222] to-[#161616] border border-emerald-800/60 rounded-3xl p-10 md:p-14 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            READY TO UPGRADE YOUR <YellowTape text="BATTLESTATION?" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Discover our curated lineup of gaming mice, mechanical keyboards, magnetic switches, and high-performance monitors with fast nationwide delivery.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={navigateToShop}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xl"
            >
              Explore Shop Catalog <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={navigateToContact}
              className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/80 font-bold px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
