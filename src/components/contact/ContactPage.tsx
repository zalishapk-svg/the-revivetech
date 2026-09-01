import React, { useState } from "react";
import { motion } from "framer-motion";
import { YellowTape } from "../common/YellowTape";
import { useShopify } from "../../context/ShopifyContext";
import { 
  MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, 
  HelpCircle, ShieldCheck, Headphones, ExternalLink
} from "lucide-react";

export const ContactPage: React.FC = () => {
  const { navigateToFAQ, showToast } = useShopify();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Order Inquiry",
    orderId: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast("Please fill in all required fields.");
      return;
    }
    setSubmitted(true);
    showToast("Message sent! Our support team will contact you shortly.");
  };

  return (
    <div className="w-full bg-[#161616] text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
          <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60 inline-block">
            Customer Support & RMA
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            GET IN TOUCH WITH <YellowTape text="THEREREVIVETECH" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Have questions about product specs, order tracking, switch compatibility, or warranty claims? Our hardware specialists are here to help.
          </p>
        </div>

        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl p-6 space-y-3 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Lahore Store & Center</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Commercial Market, 96-D, Block D, DHA EME Sector, Lahore, Pakistan
              </p>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Main Distribution Hub</span>
          </div>

          <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl p-6 space-y-3 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Phone & WhatsApp</h4>
              <p className="text-xs text-slate-400 font-mono">
                0347 5799958
              </p>
            </div>
            <a 
              href="https://wa.me/923475799958" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Chat on WhatsApp <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl p-6 space-y-3 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Email Support</h4>
              <p className="text-xs text-slate-400 font-mono">
                therevivetech@gmail.com
              </p>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Fast Response Guaranteed</span>
          </div>

          <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl p-6 space-y-3 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Operating Hours</h4>
              <p className="text-xs text-slate-400">
                Mon - Sat: 10:00 AM - 8:00 PM (PKT)<br />
                Sunday: Emergency Dispatch Only
              </p>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Pakistan Standard Time</span>
          </div>
        </div>

        {/* Contact Form & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contact Form */}
          <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Send Support Ticket</h3>
              <p className="text-xs text-slate-400">Fill out the form below and an engineer will assist you.</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-slate-950">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Ticket Submitted Successfully</h4>
                <p className="text-xs text-slate-300">
                  Thank you, <strong className="text-emerald-400">{formData.name}</strong>. Ticket ID <span className="font-mono text-emerald-400">TRT-9842</span> has been assigned.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", subject: "Order Inquiry", orderId: "", message: "" }); }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ali Khan"
                      className="w-full bg-[#161616] border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ali@example.com"
                      className="w-full bg-[#161616] border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+92 300 0000000"
                      className="w-full bg-[#161616] border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Order ID (If applicable)</label>
                    <input
                      type="text"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="#TRT-1042"
                      className="w-full bg-[#161616] border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#161616] border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Order Inquiry">Order Inquiry / Shipping Tracking</option>
                    <option value="Product Spec Question">Product Specs & Switch Compatibility</option>
                    <option value="Warranty Claim">Official Brand Warranty Claim (RMA)</option>
                    <option value="Wholesale">Bulk / Esports Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your query in detail..."
                    className="w-full bg-[#161616] border border-emerald-900/60 rounded-xl p-4 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" /> Send Ticket
                </button>
              </form>
            )}
          </div>

          {/* Interactive Map & Quick Support Options */}
          <div className="space-y-6">
            
            {/* Map Preview Container */}
            <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" /> Store & Service Center Location
              </h3>
              
              <div className="w-full h-64 bg-[#161616] rounded-2xl overflow-hidden border border-emerald-900/60 relative group flex items-center justify-center p-0">
                <iframe
                  title="ThereReviveTech Map Location - Commercial Market, 96-D, Block D, DHA EME Sector, Lahore, Pakistan"
                  src="https://maps.google.com/maps?q=Commercial+Market,+96-D,+Block+D,+DHA+EME+Sector,+Lahore,+Pakistan&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                  allowFullScreen
                  loading="lazy"
                />

                {/* Custom Animated Location Marker with Store Favicon */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {/* Ground Radar/Pulse Glow */}
                  <div className="absolute w-12 h-6 rounded-full bg-emerald-500/20 blur-sm translate-y-6 animate-pulse" />
                  
                  {/* Animated Floating Store Pin */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative flex flex-col items-center -translate-y-4"
                  >
                    {/* Store Title Badge on Pin */}
                    <div className="mb-1.5 px-2.5 py-0.5 rounded-full bg-[#161616]/95 border border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)] backdrop-blur-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] font-mono font-bold text-white tracking-wider whitespace-nowrap">
                        The Revive Tech
                      </span>
                    </div>

                    {/* Custom Favicon Pin Body */}
                    <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-emerald-600 via-emerald-400 to-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.5)] flex items-center justify-center">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#161616] border border-black/40 flex items-center justify-center">
                        <img
                          src="https://cdn.shopify.com/s/files/1/0610/4642/3631/files/Final_Presentation_Momin_Bhai.jpg?v=1786431805"
                          alt="The Revive Tech Store"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Pin Tip Arrow */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-500 drop-shadow-md" />
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-emerald-900/40">
                <span className="truncate max-w-[240px] sm:max-w-none">Commercial Market, 96-D, Block D, DHA EME Sector, Lahore, Pakistan</span>
                <a
                  href="https://maps.google.com/?q=Commercial+Market,+96-D,+Block+D,+DHA+EME+Sector,+Lahore,+Pakistan"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-mono shrink-0 ml-2"
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick FAQ Shortcut Banner */}
            <div className="bg-gradient-to-r from-[#1c1c1c] via-[#222222] to-[#161616] border border-emerald-800/60 rounded-3xl p-6 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-400" /> Have a quick question?
                </h4>
                <p className="text-xs text-slate-300">
                  Check our Knowledge Base for shipping times, warranty policy & return guides.
                </p>
              </div>

              <button
                onClick={navigateToFAQ}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap shrink-0 transition-colors"
              >
                View FAQ
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
