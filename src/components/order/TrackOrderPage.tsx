import React, { useState, useEffect } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Calendar,
  CreditCard,
  ChevronRight,
  Printer,
  Headphones,
  ShoppingBag,
} from "lucide-react";
import { useShopify } from "../../context/ShopifyContext";
import { OrderTrackingInfo } from "../../types";

interface TrackOrderPageProps {
  initialOrderNumber?: string;
  initialEmail?: string;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  initialOrderNumber = "",
  initialEmail = "",
}) => {
  const { navigateToShop, navigateToHome, navigateToContact, showToast } = useShopify();

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<OrderTrackingInfo | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  // Auto-search if initial query parameters were provided
  useEffect(() => {
    if (initialOrderNumber && initialEmail) {
      handleLookup(initialOrderNumber, initialEmail);
    }
  }, [initialOrderNumber, initialEmail]);

  const handleLookup = async (orderNumToSearch?: string, emailToSearch?: string) => {
    const targetOrder = (orderNumToSearch !== undefined ? orderNumToSearch : orderNumberInput).trim();
    const targetEmail = (emailToSearch !== undefined ? emailToSearch : emailInput).trim();

    if (!targetOrder) {
      setErrorMessage("Please enter your Order Number (e.g. #1048 or RT12345).");
      return;
    }

    if (!targetEmail || !targetEmail.includes("@")) {
      setErrorMessage("Please enter the valid email address used when placing your order.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: targetOrder,
          email: targetEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data?.error ||
            "We couldn't find an order matching those details. Please check your order number and email address and try again."
        );
        setTrackingData(null);
      } else {
        setTrackingData(data.order);
        setErrorMessage(null);
      }
    } catch (err: any) {
      console.error("[Track Order Request Error]", err);
      setErrorMessage(
        "Something went wrong while checking your order. Please try again in a moment."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup();
  };

  const handleCopyTrackingNumber = (trackingNumber: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(trackingNumber);
      setCopiedTrackingId(id);
      showToast("Tracking number copied to clipboard!");
      setTimeout(() => setCopiedTrackingId(null), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (amount: number, currency = "PKR") => {
    if (currency === "PKR") {
      return `Rs. ${amount.toLocaleString("en-PK")}`;
    }
    return `${currency} ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getFinancialBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "bg-emerald-950/80 text-emerald-400 border-emerald-700/60";
      case "PENDING":
        return "bg-amber-950/80 text-amber-300 border-amber-700/60";
      case "REFUNDED":
      case "VOIDED":
        return "bg-rose-950/80 text-rose-400 border-rose-700/60";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  const getFulfillmentBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-[#C0FE2D]/20 text-[#C0FE2D] border-[#C0FE2D]/50 font-bold";
      case "FULFILLED":
      case "IN_TRANSIT":
      case "OUT_FOR_DELIVERY":
        return "bg-cyan-950/80 text-cyan-300 border-cyan-700/60 font-semibold";
      case "PARTIALLY_FULFILLED":
        return "bg-indigo-950/80 text-indigo-300 border-indigo-700/60";
      case "UNFULFILLED":
      default:
        return "bg-amber-950/80 text-amber-400 border-amber-700/60";
    }
  };

  return (
    <div className="min-h-screen bg-[#161616] text-slate-100 py-10 sm:py-16 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-[#C0FE2D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-[#C0FE2D]" />
            <span>Real-Time Order Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Track Your Order
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Enter your order reference number and the email address used during checkout to check live shipment status, courier dispatch, and delivery updates.
          </p>
        </div>

        {/* Search Input Card */}
        <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order Number Field */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="orderNumberInput"
                  className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-mono"
                >
                  Order Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/80 font-mono font-bold text-sm">
                    #
                  </div>
                  <input
                    id="orderNumberInput"
                    type="text"
                    required
                    value={orderNumberInput}
                    onChange={(e) => setOrderNumberInput(e.target.value)}
                    placeholder="1048 or RT-12345"
                    className="w-full pl-8 pr-4 py-3 bg-[#222222] border border-emerald-800/50 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C0FE2D] focus:ring-1 focus:ring-[#C0FE2D] transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Example: <span className="text-slate-300 font-mono">#1048</span> or <span className="text-slate-300 font-mono">1048</span>
                </p>
              </div>

              {/* Email Address Field */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="emailInput"
                  className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-mono"
                >
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-emerald-400" />
                  </div>
                  <input
                    id="emailInput"
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#222222] border border-emerald-800/50 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C0FE2D] focus:ring-1 focus:ring-[#C0FE2D] transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  The email address specified during checkout
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 bg-rose-950/50 border border-rose-800/60 rounded-2xl flex items-start gap-3 text-rose-300 text-xs sm:text-sm animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-rose-200">{errorMessage}</p>
                  <p className="text-[11px] text-rose-300/80">
                    Need help? Reach out to support at{" "}
                    <a href="mailto:therevivetech@gmail.com" className="underline font-semibold">
                      therevivetech@gmail.com
                    </a>{" "}
                    or call{" "}
                    <a href="tel:03475799958" className="underline font-semibold">
                      0347 5799958
                    </a>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Direct Shopify Fulfillment Data</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#C0FE2D] hover:bg-[#d2ff4d] active:scale-[0.98] text-slate-950 font-bold text-sm rounded-2xl transition-all shadow-lg shadow-[#C0FE2D]/10 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Searching Order...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-slate-950" />
                    <span>Track Order</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Details Display (Rendered when found) */}
        {trackingData && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top Order Status Card */}
            <div className="bg-[#1c1c1c] border border-emerald-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-900/40">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                      Order {trackingData.orderNumber}
                    </h2>
                    <span
                      className={`text-xs px-3 py-1 rounded-full border font-bold uppercase ${getFulfillmentBadgeClass(
                        trackingData.fulfillmentStatus
                      )}`}
                    >
                      {trackingData.fulfillmentStatus.replace("_", " ")}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full border font-bold uppercase ${getFinancialBadgeClass(
                        trackingData.financialStatus
                      )}`}
                    >
                      Payment: {trackingData.financialStatus.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Placed on {formatDate(trackingData.createdAt)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-2 bg-[#222222] hover:bg-[#2a2a2a] border border-emerald-800/40 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => {
                      setTrackingData(null);
                      setOrderNumberInput("");
                      setEmailInput("");
                    }}
                    className="px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>New Search</span>
                  </button>
                </div>
              </div>

              {/* Real Timeline Visualization */}
              <div className="py-6 sm:py-8">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Shipment Progress Timeline</span>
                </h3>

                <div className="relative">
                  {/* Timeline Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                    {trackingData.timeline.map((step, idx) => {
                      const isLast = idx === trackingData.timeline.length - 1;
                      return (
                        <div key={step.stage} className="flex md:flex-col items-start gap-3.5 relative">
                          {/* Circle Icon */}
                          <div className="relative z-10 shrink-0">
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
                                step.isCompleted
                                  ? "bg-[#C0FE2D] text-slate-950 border-[#D4FF66] shadow-md shadow-[#C0FE2D]/20"
                                  : step.isCurrent
                                  ? "bg-emerald-950 text-emerald-400 border-emerald-500 animate-pulse ring-4 ring-emerald-500/20"
                                  : "bg-[#222222] text-slate-600 border-zinc-800"
                              }`}
                            >
                              {step.stage === "placed" && <ShoppingBag className="w-4 h-4" />}
                              {step.stage === "confirmed" && <ShieldCheck className="w-4 h-4" />}
                              {step.stage === "processing" && <Package className="w-4 h-4" />}
                              {step.stage === "shipped" && <Truck className="w-4 h-4" />}
                              {step.stage === "delivered" && <CheckCircle2 className="w-4 h-4" />}
                              {step.stage === "cancelled" && <AlertCircle className="w-4 h-4 text-rose-400" />}
                            </div>
                          </div>

                          {/* Text content */}
                          <div className="space-y-1">
                            <h4
                              className={`text-xs font-bold ${
                                step.isCompleted
                                  ? "text-white"
                                  : step.isCurrent
                                  ? "text-[#C0FE2D]"
                                  : "text-slate-500"
                              }`}
                            >
                              {step.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-snug">
                              {step.description}
                            </p>
                            {step.timestamp && (
                              <p className="text-[10px] text-emerald-400/90 font-mono font-medium pt-0.5">
                                {formatDate(step.timestamp)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Shipment Tracking Details Box */}
              {trackingData.fulfillments.length > 0 ? (
                <div className="space-y-4 pt-6 border-t border-emerald-900/40">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#C0FE2D]" />
                    <span>Courier & Tracking Information</span>
                  </h3>

                  {trackingData.fulfillments.map((ful, index) => (
                    <div
                      key={ful.id || index}
                      className="p-5 bg-[#222222] border border-emerald-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">
                            {ful.company || "Express Courier Logistics"}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 uppercase">
                            Status: {ful.displayStatus || ful.status}
                          </span>
                        </div>

                        {ful.trackingNumber && (
                          <div className="flex items-center gap-2 pt-1 text-xs">
                            <span className="text-slate-400">Tracking ID:</span>
                            <span className="font-mono text-emerald-300 font-bold bg-[#181818] px-2 py-0.5 rounded border border-emerald-900/50">
                              {ful.trackingNumber}
                            </span>
                            <button
                              onClick={() => handleCopyTrackingNumber(ful.trackingNumber!, ful.id)}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                              title="Copy Tracking Number"
                            >
                              {copiedTrackingId === ful.id ? (
                                <Check className="w-3.5 h-3.5 text-[#C0FE2D]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}

                        {ful.estimatedDeliveryAt && (
                          <p className="text-xs text-slate-400 pt-0.5">
                            Estimated Delivery:{" "}
                            <span className="text-white font-medium">
                              {formatDate(ful.estimatedDeliveryAt)}
                            </span>
                          </p>
                        )}
                      </div>

                      {ful.trackingUrl ? (
                        <a
                          href={ful.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 shadow"
                        >
                          <span>Track on Courier Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <div className="text-xs text-slate-400 italic">
                          Dispatched via registered ground network
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pt-6 border-t border-emerald-900/40">
                  <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl flex items-start gap-3 text-xs text-slate-300">
                    <Package className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-300">
                        Awaiting Courier Dispatch
                      </p>
                      <p className="text-slate-400 mt-0.5">
                        Your hardware items are currently being processed, QA tested, and packaged at our Lahore fulfillment hub. Courier tracking numbers and external links will appear here immediately upon dispatch.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Items & Shipping Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Ordered Products (7 cols) */}
              <div className="md:col-span-7 bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>Order Items ({trackingData.itemCount})</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Currency: {trackingData.currency}
                  </span>
                </div>

                <div className="space-y-3 divide-y divide-emerald-950/80">
                  {trackingData.lineItems.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3.5">
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-[#222222] border border-emerald-900/40 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-600" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                          {item.title}
                        </h4>
                        {item.variantTitle && (
                          <p className="text-[11px] text-slate-400 truncate">
                            Variant: {item.variantTitle}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400">
                          Qty: <span className="text-white font-bold">{item.quantity}</span> × {formatPrice(item.unitPrice, trackingData.currency)}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-bold text-[#C0FE2D] font-mono">
                          {formatPrice(item.totalPrice, trackingData.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-emerald-900/40 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">
                      {formatPrice(trackingData.subtotalAmount, trackingData.currency)}
                    </span>
                  </div>

                  {trackingData.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Discount Applied</span>
                      <span className="font-mono">
                        -{formatPrice(trackingData.discountAmount, trackingData.currency)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Shipping ({trackingData.shippingMethod?.title || "Express Delivery"})</span>
                    <span className="font-mono text-white">
                      {trackingData.shippingAmount === 0
                        ? "FREE"
                        : formatPrice(trackingData.shippingAmount, trackingData.currency)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-emerald-900/40 flex justify-between items-center text-sm font-bold">
                    <span className="text-white">Total Amount</span>
                    <span className="text-[#C0FE2D] font-mono text-base">
                      {formatPrice(trackingData.totalAmount, trackingData.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Customer Info (5 cols) */}
              <div className="md:col-span-5 space-y-6">
                
                {/* Shipping Address */}
                <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-6 shadow-xl space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Delivery Address</span>
                  </h3>
                  <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
                    <p className="font-bold text-white text-sm">
                      {trackingData.customer.name}
                    </p>
                    <p>{trackingData.shippingAddress.address1}</p>
                    {trackingData.shippingAddress.address2 && (
                      <p>{trackingData.shippingAddress.address2}</p>
                    )}
                    <p>
                      {trackingData.shippingAddress.city},{" "}
                      {trackingData.shippingAddress.province}{" "}
                      {trackingData.shippingAddress.postalCode}
                    </p>
                    <p>{trackingData.shippingAddress.country}</p>
                    
                    {trackingData.customer.phone && (
                      <p className="pt-2 text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{trackingData.customer.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment & Security Info */}
                <div className="bg-[#1c1c1c] border border-emerald-900/40 rounded-3xl p-6 shadow-xl space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Payment Method</span>
                  </h3>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-white">
                      {trackingData.paymentMethod}
                    </p>
                    <p className="text-slate-400">
                      Payment Status:{" "}
                      <span className="text-emerald-300 font-semibold uppercase">
                        {trackingData.financialStatus}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Support Helpline Card */}
                <div className="bg-emerald-950/60 border border-emerald-800/40 rounded-3xl p-6 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-emerald-400" />
                    <span>Need Order Assistance?</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our technical support team in Lahore is ready to assist with delivery queries, modifications, or tracking issues.
                  </p>
                  <div className="pt-1 flex flex-col gap-2 text-xs">
                    <a
                      href="tel:03475799958"
                      className="flex items-center gap-2 text-emerald-300 hover:text-emerald-200 font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>0347 5799958</span>
                    </a>
                    <a
                      href="mailto:therevivetech@gmail.com"
                      className="flex items-center gap-2 text-emerald-300 hover:text-emerald-200 font-semibold"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>therevivetech@gmail.com</span>
                    </a>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Informational Help Guide for Customers */}
        {!trackingData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="p-6 bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl space-y-2">
              <div className="p-2.5 bg-emerald-950/80 rounded-xl border border-emerald-800/40 w-fit text-emerald-400">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Find Order Number</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check the confirmation email or SMS received right after placing your order. Order numbers typically begin with <span className="text-slate-200 font-mono">#1048</span>.
              </p>
            </div>

            <div className="p-6 bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl space-y-2">
              <div className="p-2.5 bg-emerald-950/80 rounded-xl border border-emerald-800/40 w-fit text-emerald-400">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Nationwide Shipping</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Orders across Pakistan are dispatched via premium tracked couriers (TCS, Leopard, Trax) with live status updates.
              </p>
            </div>

            <div className="p-6 bg-[#1c1c1c] border border-emerald-900/40 rounded-2xl space-y-2">
              <div className="p-2.5 bg-emerald-950/80 rounded-xl border border-emerald-800/40 w-fit text-emerald-400">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Need Support?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Call our Lahore tech support desk at <span className="text-slate-200 font-mono">0347 5799958</span> or message us directly on WhatsApp.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
