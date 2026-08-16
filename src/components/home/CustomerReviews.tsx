import React from "react";
import { Star, CheckCircle, Quote } from "lucide-react";

const STORE_REVIEWS = [
  {
    name: "Ahmad Raza",
    location: "Lahore",
    date: "2 weeks ago",
    comment: "Ordered IEMs and gaming mouse pad. Received 100% authentic original products within 2 days in Lahore. Outstanding packaging!",
    rating: 5,
    verified: true,
  },
  {
    name: "Zain Ul Abideen",
    location: "Karachi",
    date: "1 month ago",
    comment: "The Revive Tech is the best place in Pakistan for genuine gaming gear. Bought Edifier speakers and Nanoleaf light panels. Super fast response!",
    rating: 5,
    verified: true,
  },
  {
    name: "Hamza Malik",
    location: "Islamabad",
    date: "3 weeks ago",
    comment: "Great customer service and official brand warranty support. EasySMX controller works flawlessly with PC and Switch.",
    rating: 5,
    verified: true,
  },
];

export const CustomerReviews: React.FC = () => {
  return (
    <section className="py-14 bg-[#161616] border-b border-emerald-900/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-emerald-900/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-slate-200 font-mono tracking-wider">
                Store Satisfaction Rating
              </span>
              <div className="flex text-amber-400 items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-white font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                4.9 / 5.0
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Customer Feedback
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono max-w-sm">
            Verified buyer ratings and feedback directly from tech enthusiasts across Pakistan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STORE_REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="bg-[#1c1c1c] border border-emerald-900/40 p-6 rounded-2xl space-y-4 relative hover:border-emerald-500/40 transition-colors"
            >
              <Quote className="w-8 h-8 text-emerald-500/10 absolute top-4 right-4" />
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{rev.date}</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{rev.comment}"
              </p>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">
                    {rev.name}
                  </h3>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Verified Buyer ({rev.location})
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
