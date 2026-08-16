import React from "react";

const BRANDS = [
  "ASUS ROG",
  "CORSAIR",
  "RAZER",
  "LOGITECH G",
  "STEELSERIES",
  "NVIDIA",
  "AMD RYZEN",
  "SECRET LAB",
  "ELGATO",
  "SENNHEISER",
];

export const BrandMarquee: React.FC = () => {
  return (
    <section className="py-8 bg-[#161616] border-b border-emerald-900/40 text-slate-400 overflow-hidden select-none">
      <div className="flex w-full overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap py-2">
          {BRANDS.concat(BRANDS).concat(BRANDS).map((brand, idx) => (
            <div key={idx} className="flex items-center gap-12">
              <span className="text-sm font-black font-mono tracking-widest text-slate-400 hover:text-emerald-400 transition-colors uppercase">
                {brand}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
