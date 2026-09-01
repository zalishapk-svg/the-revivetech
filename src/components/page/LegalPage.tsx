import React from "react";
import { YellowTape } from "../common/YellowTape";
import { ChevronRight, ShieldCheck, FileText, Truck, RotateCcw } from "lucide-react";

interface LegalPageProps {
  handle: string;
}

export const LegalPage: React.FC<LegalPageProps> = ({ handle }) => {
  const getLegalContent = () => {
    switch (handle) {
      case "privacy-policy":
        return {
          title: "PRIVACY POLICY",
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
          lastUpdated: "January 15, 2026",
          sections: [
            {
              heading: "1. Information We Collect",
              text: "We collect information you provide directly to us when creating an account, making a purchase, or contacting customer support. This includes your name, delivery address across Pakistan, phone number, email address, and order transaction records."
            },
            {
              heading: "2. How We Use Your Data",
              text: "Your information is used strictly to process orders, arrange courier delivery via TCS/Trax/Leopard in Pakistan, verify official warranty claims, send order status updates, and provide personalized technical support."
            },
            {
              heading: "3. Payment & Security",
              text: "We do NOT store your credit card or debit card details on our servers. All online transactions are processed through PCI-DSS compliant secure payment gateways with 256-bit SSL encryption. Cash on Delivery (COD) payments are handled securely by authorized logistics personnel."
            },
            {
              heading: "4. Cookies & Analytics",
              text: "We use essential cookies to maintain your shopping cart, save wishlist preferences, and analyze site performance. You may disable cookies in your browser settings, though certain cart features may be limited."
            },
            {
              heading: "5. Contact Privacy Officer",
              text: "If you have questions regarding your personal data or wish to request data deletion, contact us at privacy@therevivetech.com."
            }
          ]
        };

      case "terms-and-conditions":
        return {
          title: "TERMS & CONDITIONS",
          icon: <FileText className="w-6 h-6 text-emerald-400" />,
          lastUpdated: "February 1, 2026",
          sections: [
            {
              heading: "1. Agreement to Terms",
              text: "By accessing or placing an order on ThereReviveTech, you agree to be bound by these Terms and Conditions and all applicable laws in Pakistan."
            },
            {
              heading: "2. Pricing & Currency in Pakistan",
              text: "All prices listed on ThereReviveTech are expressed in Pakistani Rupees (PKR / Rs.) and include applicable local taxes. Prices and product availability are subject to change without prior notice."
            },
            {
              heading: "3. Product Authenticity & Warranty",
              text: "All products sold on ThereReviveTech are 100% genuine authorized hardware carrying official manufacturer local warranty. Serial numbers are cataloged at dispatch to prevent grey-market counterfeits."
            },
            {
              heading: "4. Limitation of Liability",
              text: "ThereReviveTech shall not be liable for indirect, incidental, or consequential damages resulting from product misuse, improper switch soldering, or unapproved firmware modifications."
            }
          ]
        };

      case "refund-policy":
        return {
          title: "REFUND & RETURN POLICY",
          icon: <RotateCcw className="w-6 h-6 text-emerald-400" />,
          lastUpdated: "January 10, 2026",
          sections: [
            {
              heading: "1. 7-Day Replacement Guarantee",
              text: "If your hardware arrives defective, physically damaged, or incomplete, you are eligible for an immediate replacement within 7 days of receiving your shipment in Pakistan."
            },
            {
              heading: "2. Eligibility Conditions",
              text: "Returned products must be unused, in their original packaging, with all intact seals, accessories, manual booklets, and proof of purchase (invoice)."
            },
            {
              heading: "3. Inspection & Processing",
              text: "Once your returned product is received at our Lahore Hafeez Centre technical hub, our engineers inspect the item within 24-48 hours. Upon approval, a replacement unit or store credit is issued immediately."
            },
            {
              heading: "4. Non-Refundable Items",
              text: "Opened software licenses, custom soldered switches, or products damaged due to liquid spills/accidental drops are strictly non-refundable."
            }
          ]
        };

      case "shipping-policy":
      default:
        return {
          title: "SHIPPING & DELIVERY POLICY",
          icon: <Truck className="w-6 h-6 text-emerald-400" />,
          lastUpdated: "February 5, 2026",
          sections: [
            {
              heading: "1. Delivery Coverage Across Pakistan",
              text: "We ship to over 200 cities across Pakistan including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Gujranwala, and Sialkot."
            },
            {
              heading: "2. Delivery Timelines",
              text: "Lahore & Karachi Express: Same-Day or 24 Hours. Rest of Pakistan: 24 to 48 Hours via TCS, Trax, or Leopard tracked courier service."
            },
            {
              heading: "3. Tracked Courier Services",
              text: "All orders are shipped via premier tracked courier partners (TCS, Trax, or Leopard) with live tracking details sent upon dispatch."
            },
            {
              heading: "4. Payment & Order Verification",
              text: "We accept secure Bank Transfers, JazzCash, EasyPaisa, and major debit/credit cards. Please re-confirm product availability via WhatsApp (03375799958) prior to dispatch."
            }
          ]
        };
    }
  };

  const content = getLegalContent();

  return (
    <div className="w-full bg-[#161616] text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ""; }} className="hover:text-emerald-400">
            Home
          </a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-emerald-400 font-semibold">{content.title}</span>
        </nav>

        {/* Header */}
        <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-8 md:p-10 shadow-2xl flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center shrink-0">
            {content.icon}
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{content.title}</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Last Updated: {content.lastUpdated} • Compliance in Pakistan</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-8 md:p-12 space-y-8 shadow-2xl">
          {content.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2 border-b border-emerald-900/30 pb-6 last:border-b-0 last:pb-0">
              <h3 className="text-base sm:text-lg font-bold text-emerald-400">{sec.heading}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{sec.text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
