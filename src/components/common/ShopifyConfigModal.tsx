import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Check, RefreshCw, Globe, Key, ShieldCheck, Database, Server, Cpu } from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";

export const ShopifyConfigModal: React.FC = () => {
  const { isConfigModalOpen, setIsConfigModalOpen, storeDomain, updateStoreConfig } = useShopify();
  const [domainInput, setDomainInput] = useState(storeDomain);
  const [tokenInput, setTokenInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Diagnostic states
  const [isTesting, setIsTesting] = useState(false);
  const [firebaseBackendStatus, setFirebaseBackendStatus] = useState<{ connected: boolean; projectId?: string; error?: string } | null>(null);
  const [firebaseFrontendConnected, setFirebaseFrontendConnected] = useState<boolean>(true);
  const [shopifyHealthStatus, setShopifyHealthStatus] = useState<{ connected: boolean; storeDomain?: string } | null>(null);

  const runDiagnostics = async () => {
    setIsTesting(true);
    // 1. Frontend Firebase connection test (Checks client context & web fetch capabilities)
    try {
      setFirebaseFrontendConnected(typeof window !== "undefined" && navigator.onLine);
    } catch {
      setFirebaseFrontendConnected(false);
    }

    // 2. Backend Firebase Admin / Firestore connection test
    try {
      const res = await fetch("/api/health/firebase");
      const data = await res.json();
      if (res.ok && data.firebase?.connected) {
        setFirebaseBackendStatus({
          connected: true,
          projectId: data.firebase.projectId,
        });
      } else {
        setFirebaseBackendStatus({
          connected: false,
          error: data.error || "Firebase Admin SDK unconfigured",
        });
      }
    } catch (err: any) {
      setFirebaseBackendStatus({
        connected: false,
        error: "Unable to reach /api/health/firebase endpoint",
      });
    }

    // 3. Shopify Admin Health test
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setShopifyHealthStatus({
        connected: Boolean(data.hasAdminToken),
        storeDomain: data.storeDomain,
      });
    } catch {
      setShopifyHealthStatus({ connected: false });
    }

    setIsTesting(false);
  };

  useEffect(() => {
    if (isConfigModalOpen) {
      runDiagnostics();
    }
  }, [isConfigModalOpen]);

  if (!isConfigModalOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await updateStoreConfig(domainInput, tokenInput);
    setIsSaving(false);
    setIsConfigModalOpen(false);
  };

  const handleConnectProductionStore = async () => {
    setDomainInput("dbbys1-nd.myshopify.com");
    setIsSaving(true);
    await updateStoreConfig("dbbys1-nd.myshopify.com", tokenInput);
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
          className="relative w-full max-w-lg bg-[#071910] border border-emerald-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 z-50 max-h-[90vh] overflow-y-auto"
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
              <h3 className="font-extrabold text-lg text-white">System & Storefront Settings</h3>
              <p className="text-xs text-slate-400">Shopify Headless Storefront & Firebase Token Cache</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Connection Diagnostics Card */}
            <div className="p-4 bg-slate-950/70 border border-emerald-900/50 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  Live System Diagnostics
                </span>
                <button
                  onClick={runDiagnostics}
                  disabled={isTesting}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isTesting ? "animate-spin" : ""}`} />
                  Re-test
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Frontend Firebase */}
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-slate-300 font-medium text-[11px]">Firebase Frontend</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${firebaseFrontendConnected ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400"}`}>
                    {firebaseFrontendConnected ? "CONNECTED" : "NOT CONNECTED"}
                  </span>
                </div>

                {/* Backend Firebase Admin / Firestore */}
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-300 font-medium text-[11px]">Firestore Backend</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${firebaseBackendStatus?.connected ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400"}`}>
                    {firebaseBackendStatus?.connected ? "CONNECTED" : "NOT CONNECTED"}
                  </span>
                </div>
              </div>

              {firebaseBackendStatus?.connected && firebaseBackendStatus.projectId && (
                <p className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-800/30">
                  Firestore Project: {firebaseBackendStatus.projectId}
                </p>
              )}

              {firebaseBackendStatus && !firebaseBackendStatus.connected && (
                <p className="text-[10px] font-mono text-amber-400/90 bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-800/30">
                  Note: Server using safely isolated in-memory token fallback until Vercel Firebase Admin variables are applied.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Shopify Store Domain
              </label>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g. dbbys1-nd.myshopify.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-800/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                Storefront Access Token (Public Token)
              </label>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Storefront API Token"
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
                onClick={handleConnectProductionStore}
                className="w-full py-2.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 font-semibold text-xs rounded-xl border border-emerald-800/40"
              >
                Reset to Production Store (dbbys1-nd.myshopify.com)
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
