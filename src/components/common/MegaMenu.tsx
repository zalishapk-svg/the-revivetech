import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Laptop,
  Monitor,
  Cpu,
  Headphones,
  Armchair,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

interface Department {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  collections: { title: string; handle: string; count: number }[];
  promo: {
    title: string;
    subtitle: string;
    tag: string;
    image: string;
    targetHandle: string;
  };
}

const DEPARTMENTS: Department[] = [
  {
    id: "gaming",
    name: "Gaming Peripherals",
    icon: Gamepad2,
    description: "Esports grade light mice, rapid trigger magnetic keyboards & planar headsets.",
    collections: [
      { title: "Gaming Mice", handle: "gaming-mice", count: 14 },
      { title: "Gaming Keyboards", handle: "gaming-keyboards", count: 18 },
      { title: "Gaming Headsets", handle: "gaming-headsets", count: 15 },
      { title: "Streaming Accessories", handle: "accessories", count: 26 },
    ],
    promo: {
      title: "Revive Apex Pro 8K",
      subtitle: "Microscopic 49g carbon fiber build with true 8000Hz wireless polling rate.",
      tag: "FLAGSHIP RELEASE",
      image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
      targetHandle: "revive-apex-pro-wireless-mouse",
    },
  },
  {
    id: "displays",
    name: "Monitors & Displays",
    icon: Monitor,
    description: "360Hz QD-OLED, Mini-LED & 4K high refresh rate esports monitors.",
    collections: [
      { title: "QD-OLED Displays", handle: "monitors", count: 8 },
      { title: "4K Gaming Monitors", handle: "monitors", count: 12 },
      { title: "Ultrawide Displays", handle: "monitors", count: 6 },
    ],
    promo: {
      title: "Quantum 360Hz QD-OLED",
      subtitle: "32-inch 4K resolution with 0.03ms GTG response & vapor chamber cooling.",
      tag: "FLASH DEAL",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
      targetHandle: "revive-quantum-360-qd-oled-monitor",
    },
  },
  {
    id: "computing",
    name: "Laptops & Systems",
    icon: Laptop,
    description: "Liquid-cooled RTX 5090 laptops & custom high-end prebuilt battle stations.",
    collections: [
      { title: "RTX 5090 Laptops", handle: "laptops", count: 9 },
      { title: "Creator Workstations", handle: "laptops", count: 5 },
      { title: "Gaming Laptops", handle: "laptops", count: 14 },
    ],
    promo: {
      title: "Strikeforce 18 RTX 5090",
      subtitle: "18-inch Mini-LED 240Hz screen with detachable external liquid cooling loop.",
      tag: "TOP RATED",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
      targetHandle: "revive-strikeforce-rtx-5090-laptop",
    },
  },
  {
    id: "components",
    name: "PC Components",
    icon: Cpu,
    description: "Zen 5 CPUs, flagship GPUs, PCIe 5.0 SSDs & high-speed DDR5 memory.",
    collections: [
      { title: "Processors (CPUs)", handle: "pc-components", count: 22 },
      { title: "Graphics Cards (GPUs)", handle: "pc-components", count: 16 },
      { title: "Storage & Memory", handle: "pc-components", count: 30 },
    ],
    promo: {
      title: "AMD Ryzen 9 9950X",
      subtitle: "16 cores, 32 threads, up to 5.7GHz boost for extreme gaming workloads.",
      tag: "BEST SELLER",
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80",
      targetHandle: "revive-ryzen-9950x-cpu",
    },
  },
  {
    id: "chairs",
    name: "Chairs & Ergonomics",
    icon: Armchair,
    description: "Cold-cured memory foam gaming chairs engineered for endurance support.",
    collections: [
      { title: "Gaming Chairs", handle: "gaming-chairs", count: 8 },
      { title: "Ergonomic Desks", handle: "accessories", count: 4 },
    ],
    promo: {
      title: "Titan Pro SoftFlex Chair",
      subtitle: "Cold-cured foam, magnetic memory foam headrest, and 4D active armrests.",
      tag: "COMFORT PICK",
      image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80",
      targetHandle: "revive-titan-pro-gaming-chair",
    },
  },
];

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  // RULE 8: CLICKing changes active category; hover provides subtle visual highlight only!
  const [activeDepartmentId, setActiveDepartmentId] = useState<string>("gaming");
  const { navigateToCollection, navigateToProduct } = useShopify();

  const currentDepartment = DEPARTMENTS.find((d) => d.id === activeDepartmentId) || DEPARTMENTS[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-full left-0 w-full bg-[#071910]/98 backdrop-blur-2xl border-b border-emerald-900/40 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.85)] z-50 text-slate-100"
          onMouseLeave={onClose}
        >
          <div className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Department Category List (Rule 7 & 8) */}
            <div className="col-span-12 lg:col-span-4 border-r border-emerald-900/30 pr-6 space-y-2">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-emerald-900/30">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Select Department
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Click to toggle view</span>
              </div>

              {DEPARTMENTS.map((dept) => {
                const IconComponent = dept.icon;
                const isActive = dept.id === activeDepartmentId;

                return (
                  <button
                    key={dept.id}
                    onClick={() => setActiveDepartmentId(dept.id)} // RULE 8: CLICK activates category
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-center justify-between group ${
                      isActive
                        ? "bg-emerald-950/80 border border-emerald-500/40 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                        : "hover:bg-emerald-950/30 text-slate-300 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-emerald-900/30 text-emerald-400 group-hover:bg-emerald-900/50"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm leading-snug">{dept.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{dept.description}</p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isActive ? "text-emerald-400 translate-x-1" : "text-slate-600 group-hover:text-slate-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* CENTER COLUMN: Dynamic Collections for Selected Department */}
            <div className="col-span-12 lg:col-span-4 pr-4 space-y-4">
              <div className="pb-3 border-b border-emerald-900/30 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Collections in {currentDepartment.name}
                </span>
                <span className="text-[11px] text-slate-400">{currentDepartment.collections.length} Collections</span>
              </div>

              <div className="space-y-2.5">
                {currentDepartment.collections.map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      navigateToCollection(col.handle);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-lg bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-900/20 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-medium text-sm text-slate-200 group-hover:text-emerald-300 transition-colors">
                        {col.title}
                      </span>
                      <span className="block text-[11px] text-slate-400 font-mono">
                        {col.count} Products Available
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  navigateToCollection("gaming-mice");
                  onClose();
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 pt-2"
              >
                View All Shopify Store Collections <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* RIGHT COLUMN: Featured Promo / Product Showcase */}
            <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-emerald-950/60 to-slate-900/90 rounded-2xl p-4 border border-emerald-800/30 relative overflow-hidden flex flex-col justify-between">
              
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase mb-2">
                  <Zap className="w-3 h-3 fill-slate-950" />
                  {currentDepartment.promo.tag}
                </span>
                <h3 className="text-base font-bold text-white mb-1">{currentDepartment.promo.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {currentDepartment.promo.subtitle}
                </p>
              </div>

              <div className="relative h-36 w-full rounded-xl overflow-hidden my-2 border border-emerald-800/40 group">
                <img
                  src={currentDepartment.promo.image}
                  alt={currentDepartment.promo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

              <button
                onClick={() => {
                  navigateToProduct(currentDepartment.promo.targetHandle);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                Explore Product Details <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
