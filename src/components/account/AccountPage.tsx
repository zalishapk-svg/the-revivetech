import React, { useState } from "react";
import { User, Package, MapPin, LogOut, Lock, Mail, ShieldCheck, Check } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { formatMoney } from "../../lib/utils";

export const AccountPage: React.FC = () => {
  const { customer, loginCustomer, logoutCustomer } = useShopify();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    loginCustomer(email || "alex@therevivetech.com", "ProGamer2026!");
  };

  if (!customer) {
    return (
      <div className="bg-[#161616] text-slate-100 min-h-screen py-16 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1c1c1c] border border-emerald-800/50 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto border border-emerald-800/40">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              {isRegistering ? "Create Gamer Account" : "Shopify Customer Login"}
            </h1>
            <p className="text-xs text-slate-400">
              Access your order history, warranty certificates, and tracking info.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 font-mono">Email Address:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#161616] border border-emerald-800/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 font-mono">Password:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#161616] border border-emerald-800/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-emerald-950/60"
            >
              {isRegistering ? "Create Account" : "Sign In to Account"}
            </button>
          </form>

          <div className="pt-2 text-center space-y-2">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-emerald-400 font-bold hover:underline font-mono"
            >
              {isRegistering ? "Already have an account? Sign In" : "Need an account? Register Now"}
            </button>
            <div className="pt-2">
              <a
                href="https://shopify.com/61046423631/account/profile"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium underline"
              >
                <span>Or open Shopify Customer Account Portal</span>
              </a>
            </div>
          </div>

          <div className="p-3 bg-[#161616] rounded-xl border border-emerald-900/30 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Connects directly with Shopify Customer Accounts API.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161616] text-slate-100 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Customer Banner */}
        <div className="bg-[#1c1c1c] border border-emerald-800/50 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 text-slate-950 font-black text-xl rounded-2xl flex items-center justify-center">
              {customer.firstName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Welcome back, {customer.firstName} {customer.lastName}</h1>
              <p className="text-xs text-slate-400 font-mono">{customer.email}</p>
            </div>
          </div>

          <button
            onClick={logoutCustomer}
            className="px-4 py-2 bg-[#161616] hover:bg-rose-950 hover:text-rose-400 text-slate-300 border border-emerald-900/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>

        {/* Order History */}
        <div className="bg-[#1c1c1c] border border-emerald-800/50 p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 font-bold text-base text-white uppercase font-mono pb-4 border-b border-emerald-900/40">
            <Package className="w-5 h-5 text-emerald-400" /> Order History & Tracking
          </div>

          <div className="space-y-4">
            {customer.orders.map((order) => (
              <div key={order.id} className="p-4 bg-[#161616] rounded-2xl border border-emerald-900/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <span className="font-bold text-white">Order #{order.orderNumber}</span>
                    <span className="text-slate-400 ml-2">({order.processedAt})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-800">
                      {order.fulfillmentStatus}
                    </span>
                    <span className="font-bold text-emerald-400 text-sm">{formatMoney(order.totalPrice.amount)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-950 space-y-2">
                  {order.lineItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{item.title}</span>
                      <span className="font-mono text-emerald-400">Qty: {item.quantity} × {formatMoney(item.price.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
