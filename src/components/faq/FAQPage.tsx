import React, { useState, useMemo } from "react";
import { YellowTape } from "../common/YellowTape";
import { useShopify } from "../../context/ShopifyContext";
import { 
  Search, ChevronDown, HelpCircle, Package, Truck, ShieldCheck, 
  CreditCard, RotateCcw, Wrench, MessageSquare, Sparkles 
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "Orders" | "Products" | "Shipping" | "Returns" | "Warranty" | "Payments" | "Technical Support";
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "f1",
    category: "Orders",
    question: "How do I track my order status in Pakistan?",
    answer: "Once your order is processed, you will receive an SMS and email notification containing your TCS, Trax, or Leopard Courier tracking code. You can also view live tracking updates by logging into your account or contacting our WhatsApp support team."
  },
  {
    id: "f2",
    category: "Orders",
    question: "Can I modify or cancel my order after placing it?",
    answer: "Orders can be modified or canceled within 2 hours of placement before dispatch. Please contact our live chat or call +92 300 1234567 immediately with your order ID."
  },
  {
    id: "f3",
    category: "Shipping",
    question: "What are the shipping delivery times across Pakistan?",
    answer: "Orders in Lahore and Karachi qualify for Same-Day or Next-Day Express Delivery. For Islamabad, Rawalpindi, Faisalabad, Multan, and other cities across Pakistan, standard tracked shipping takes 24 to 48 hours."
  },
  {
    id: "f4",
    category: "Shipping",
    question: "Do you offer Cash on Delivery (COD)?",
    answer: "Yes! Cash on Delivery is available for all orders across Pakistan up to Rs. 100,000. For custom liquid-cooled rigs or orders exceeding Rs. 100,000, a partial bank transfer deposit may be requested."
  },
  {
    id: "f5",
    category: "Warranty",
    question: "How does the Official 3-Year Warranty work?",
    answer: "All gaming mice, keyboards, audio gear, and monitors purchased from ThereReviveTech carry an official local manufacturer warranty. If a hardware defect arises, bring or mail the product to our Lahore Hafeez Centre hub with your invoice for RMA diagnosis and replacement."
  },
  {
    id: "f6",
    category: "Warranty",
    question: "Are physical damage or water spills covered under warranty?",
    answer: "Standard manufacturer warranty covers electrical and component defects (such as sensor chatter, switch double-clicking, or dead pixels). Accidental liquid spills, physical drops, or unapproved firmware modifications are excluded."
  },
  {
    id: "f7",
    category: "Products",
    question: "Are all products on ThereReviveTech 100% genuine?",
    answer: "Yes, 100% guaranteed. We source directly from authorized brand distributors with verified serial numbers that can be registered on official manufacturer software (e.g. Razer Synapse, Logitech G HUB)."
  },
  {
    id: "f8",
    category: "Products",
    question: "What switch options are available for mechanical keyboards?",
    answer: "We offer linear (Red/Yellow), tactile (Brown), clicky (Blue), and magnetic Hall-Effect (Rapid Trigger) switches. Hot-swappable models allow you to replace switches without soldering."
  },
  {
    id: "f9",
    category: "Returns",
    question: "What is your return & refund policy?",
    answer: "We offer a 7-day hassle-free replacement guarantee if the product arrives damaged, defective, or incorrect. Products must be returned in their original packaging with all included accessories."
  },
  {
    id: "f10",
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept Cash on Delivery (COD), Visa & Mastercard Credit/Debit Cards, JazzCash, EasyPaisa, and Direct Bank Transfers (Meezan, HBL, Alfalah)."
  },
  {
    id: "f11",
    category: "Technical Support",
    question: "How do I install custom drivers and RGB lighting software?",
    answer: "Official driver download links are available on each product page under the Specifications tab, or you can visit our blog for step-by-step setup guides for Windows and macOS."
  }
];

export const FAQPage: React.FC = () => {
  const { navigateToContact } = useShopify();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(["f1", "f3", "f5"]));

  const categories = ["All", "Orders", "Products", "Shipping", "Returns", "Warranty", "Payments", "Technical Support"];

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full bg-[#161616] text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      {/* Inject FAQ Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_DATA.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header & Search */}
        <div className="text-center space-y-4 pt-4">
          <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60 inline-block">
            Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            FREQUENTLY ASKED <YellowTape text="QUESTIONS" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Find instant answers regarding shipping across Pakistan, warranty claims, payment options, and switch compatibility.
          </p>

          {/* Search Input */}
          <div className="relative max-w-lg mx-auto pt-2">
            <Search className="w-4 h-4 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. warranty, COD, delivery time)..."
              className="w-full bg-[#1c1c1c] border border-emerald-900/60 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xl"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-950/40"
                  : "bg-[#1c1c1c] border border-emerald-900/40 text-slate-300 hover:text-emerald-400 hover:border-emerald-700/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl p-10 text-center">
              <HelpCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white mb-1">No matching questions found</h3>
              <p className="text-xs text-slate-400 mb-4">Try typing different keywords or browse all categories.</p>
              <button
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredFAQs.map((item) => {
              const isOpen = openIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl overflow-hidden transition-colors hover:border-emerald-700/60 shadow-lg"
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 shrink-0">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-slate-100 text-sm sm:text-base">{item.question}</h4>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-emerald-900/30 pt-4 bg-[#161616]/60">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions Banner */}
        <div className="bg-gradient-to-r from-[#1c1c1c] via-[#222222] to-[#161616] border border-emerald-800/60 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <h3 className="text-xl font-bold text-white">Still have questions?</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Our hardware engineers in Lahore & Karachi are available on live chat and WhatsApp to assist you.
          </p>
          <button
            onClick={navigateToContact}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
          >
            <MessageSquare className="w-4 h-4" /> Contact Support Team
          </button>
        </div>

      </div>
    </div>
  );
};
