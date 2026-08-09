import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Check, RefreshCw, Globe, Key, ShieldCheck } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const ShopifyConfigModal: React.FC = () => {
  const { isConfigModalOpen, setIsConfigModalOpen, storeDomain, isMockShop, updateStoreConfig, refreshData } = useShopify();
  const [domainInput, setDomainInput] = useState(storeDomain);
  const [tokenInput, setTokenInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isConfigModalOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await updateStoreConfig(domainInput, tokenInput);
    setIsSaving(false);
    setIsConfigModalOpen(false);
  };

  const handleUseMockShop = async () => {
    setDomainInput("mock.shop");
    setTokenInput("");
    setIsSaving(true);
    await updateStoreConfig("mock.shop", "");
    setIsSaving(false);
    setIsConfigModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsConfigModalOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-[#071910] border border-emerald-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 z-50"
        >
          <button
            onClick={() => setIsConfigModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-emerald-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Shopify Storefront Connector</h3>
              <p className="text-xs text-slate-400">Connect to any live Shopify store via Storefront GraphQL API</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Store Domain
              </label>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g. store.domain.com or mock.shop"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-800/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                Storefront Access Token (Optional for mock.shop)
              </label>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Storefront API token (32 chars)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-800/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Token stays server-side in proxy endpoints and is never exposed in client JS bundle.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Connect & Fetch Storefront Data
              </button>

              <button
                onClick={handleUseMockShop}
                className="w-full py-2.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 font-semibold text-xs rounded-xl border border-emerald-800/40"
              >
                Use Built-in Active Demo Store (mock.shop)
              </button>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-emerald-900/30 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                All product changes, prices, inventory updates, collections, and articles published in Shopify Admin automatically reflect through these live GraphQL endpoints.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
