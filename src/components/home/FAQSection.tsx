import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "How does TheReviveTech ensure 100% authentic products?",
    a: "All items in our store are sourced directly from authorized brand distributors with verified serial numbers and official manufacturer warranties. We guarantee 100% genuine hardware with full warranty support.",
  },
  {
    q: "What is 8000Hz HyperPolling and does my computer support it?",
    a: "8000Hz polling sends 8,000 motion updates per second to your CPU (0.125ms delay). It is recommended for monitors running at 240Hz, 360Hz, or higher paired with modern Intel Core i7/i9 or AMD Ryzen 7/9 processors.",
  },
  {
    q: "What warranty coverage is included with hardware purchases?",
    a: "Warranties vary depending on the product type, brand, and manufacturer. Specific warranty terms, coverage periods, and replacement details are listed directly on each product's page. All items are 100% genuine with official brand support.",
  },
  {
    q: "How fast is express shipping?",
    a: "Orders placed before 2 PM EST are dispatched same-day from our logistics centers. Express domestic shipping takes 1-2 business days with full real-time tracking.",
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 bg-[#161616] border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-white flex justify-between items-center hover:text-emerald-300"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-emerald-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-emerald-950 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
