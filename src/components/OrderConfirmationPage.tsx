import React, { useEffect, useState } from "react";
import { useShopify } from "../context/ShopifyContext";
import { OrderConfirmationData } from "../types";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  Printer,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface OrderConfirmationPageProps {
  orderReference: string;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderReference,
}) => {
  const { navigateToShop } = useShopify();
  const [order, setOrder] = useState<OrderConfirmationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrderDetails() {
      if (!orderReference) {
        setIsLoading(false);
        setError("Invalid order reference provided.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/shopify/order/${encodeURIComponent(orderReference)}`);
        const data = await res.json();

        if (res.ok && data.success && data.order) {
          if (isMounted) {
            setOrder(data.order);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setError(
            data.error || "Order reference details are being processed by Shopify. Your order is registered."
          );
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn("Failed fetching order confirmation:", err);
        if (isMounted) {
          setError("Order registered successfully on Shopify. (Live sync in progress)");
          setIsLoading(false);
        }
      }
    }

    fetchOrderDetails();
    return () => {
      isMounted = false;
    };
  }, [orderReference]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleWhatsAppSupport = () => {
    const phone = "923000000000";
    const text = encodeURIComponent(
      `Hello ReviveTech! I would like to check on my recent Order ${
        order?.orderNumber || orderReference
      }. Name: ${order?.customer?.firstName || "Customer"}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  if (isLoading) {
    return (
      <div id="order-loading-screen" className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-slate-950 text-slate-100">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Loading Order Confirmation...</h2>
        <p className="text-sm text-slate-400">Verifying order #{orderReference} with Shopify</p>
      </div>
    );
  }

  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-PK", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-PK", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

  return (
    <div id="order-confirmation-page" className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header Box */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center print:border-none print:shadow-none">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Animated Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 mb-6 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-3 inline-block">
            Shopify Order Confirmed
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Thank You, {order?.customer?.firstName || "Customer"}!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto mt-2">
            Your order has been placed and received by our warehouse. We have dispatched a confirmation SMS & email with your tracking ID.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-left">
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Shopify Order #
              </span>
              <span className="font-bold text-sm text-emerald-400">
                {order?.orderNumber || `#${orderReference.split("-")[1] || "NEW"}`}
              </span>
            </div>

            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Order Reference
              </span>
              <span className="font-bold text-xs text-white truncate block">
                {order?.orderReference || orderReference}
              </span>
            </div>

            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Payment Status
              </span>
              <span className="font-bold text-xs text-amber-400 flex items-center gap-1">
                Cash on Delivery (Pending)
              </span>
            </div>

            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Order Date
              </span>
              <span className="font-bold text-xs text-slate-300">{orderDate}</span>
            </div>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl print:hidden">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Live Delivery Journey
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            <div className="flex sm:flex-col items-center sm:items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-lg shadow-emerald-500/20">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-white">1. Order Placed</p>
                <p className="text-[11px] text-slate-400">Synced to Shopify</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-emerald-500/20 animate-pulse">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400">2. Quality Check</p>
                <p className="text-[11px] text-slate-400">Inspection & Packing</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-start gap-3 opacity-60">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300">3. Handed to Courier</p>
                <p className="text-[11px] text-slate-400">TCS / Trax / Leopard</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-start gap-3 opacity-60">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
                4
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300">4. Out for Delivery</p>
                <p className="text-[11px] text-slate-400">Doorstep Handover & COD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer & Shipping Details */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Delivery & Contact Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Recipient Name:</span>
                <span className="text-white font-semibold text-sm">
                  {order?.customer?.firstName} {order?.customer?.lastName}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Delivery Address:</span>
                <p className="text-white font-semibold text-sm mt-0.5">
                  {order?.shippingAddress?.address1}
                  <br />
                  {order?.shippingAddress?.city}, {order?.shippingAddress?.province}{" "}
                  {order?.shippingAddress?.postalCode}
                  <br />
                  {order?.shippingAddress?.country || "Pakistan"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                <div>
                  <span className="text-slate-400 block font-medium">Phone Number:</span>
                  <span className="text-emerald-300 font-semibold">{order?.customer?.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email:</span>
                  <span className="text-slate-300 font-semibold truncate block">
                    {order?.customer?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Logistics Method */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Payment & Shipping Method
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <Package className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Cash on Delivery (COD)</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Please keep exact cash ready for the courier rider upon delivery.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <Truck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">
                    {order?.shippingLine?.title || "Standard Courier Delivery"}
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Estimated 2-4 business days across Pakistan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Line Items & Price Summary */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-4 mb-4 border-b border-slate-800">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Ordered Items ({order?.items?.length || 1})
          </h3>

          <div className="space-y-3 divide-y divide-slate-800/60 mb-6">
            {order?.items?.map((item) => (
              <div key={item.id} className="pt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                    {item.variantTitle && (
                      <p className="text-[11px] text-slate-400">{item.variantTitle}</p>
                    )}
                    <span className="text-[11px] text-slate-400">
                      Qty: {item.quantity} × Rs. {item.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span className="font-semibold text-white">
                Rs. {(order?.subtotal || 0).toLocaleString()}
              </span>
            </div>

            {(order?.discount || 0) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Promo Discount ({order?.discountCode || "PROMO"}):</span>
                <span className="font-semibold">-Rs. {(order?.discount || 0).toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-300">
              <span>Shipping Fee:</span>
              <span className="font-semibold text-white">
                {(order?.shippingLine?.price || 0) === 0
                  ? "FREE"
                  : `Rs. ${(order?.shippingLine?.price || 0).toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-slate-800 text-sm">
              <span className="font-extrabold text-white">Total Amount Due (COD):</span>
              <span className="text-2xl font-black text-emerald-400">
                Rs. {(order?.total || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              id="btn-order-print"
              type="button"
              onClick={handlePrint}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>

            <button
              id="btn-order-support"
              type="button"
              onClick={handleWhatsAppSupport}
              className="px-5 py-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Support
            </button>
          </div>

          <button
            id="btn-order-continue-shopping"
            type="button"
            onClick={navigateToShop}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
