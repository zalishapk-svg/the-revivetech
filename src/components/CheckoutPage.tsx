import React, { useState, useEffect, useCallback } from "react";
import { useShopify } from "../context/ShopifyContext";
import { CheckoutCustomerData, CheckoutShippingAddress, ShippingOption } from "../types";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Building2,
  Phone,
  Mail,
  User,
  MapPin,
  AlertCircle,
  Loader2,
  Sparkles,
  Tag,
  Clock,
  Package,
  ExternalLink,
} from "lucide-react";

export const CheckoutPage: React.FC = () => {
  const {
    cartLines,
    cartSubtotal,
    discountCode,
    applyDiscountCode,
    discountPercentage,
    clearCart,
    navigateToCart,
    navigateToOrderConfirmation,
    navigateToShop,
  } = useShopify();

  // Customer Data State
  const [customerData, setCustomerData] = useState<CheckoutCustomerData>(() => {
    try {
      const saved = localStorage.getItem("trt_checkout_customer");
      return saved
        ? JSON.parse(saved)
        : { firstName: "", lastName: "", email: "", phone: "" };
    } catch {
      return { firstName: "", lastName: "", email: "", phone: "" };
    }
  });

  // Shipping Address State
  const [shippingAddress, setShippingAddress] = useState<CheckoutShippingAddress>(() => {
    try {
      const saved = localStorage.getItem("trt_checkout_address");
      return saved
        ? JSON.parse(saved)
        : {
            address1: "",
            city: "Lahore",
            province: "Punjab",
            postalCode: "",
            country: "Pakistan",
          };
    } catch {
      return {
        address1: "",
        city: "Lahore",
        province: "Punjab",
        postalCode: "",
        country: "Pakistan",
      };
    }
  });

  // Order Notes & Promo
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [couponInput, setCouponInput] = useState<string>(discountCode || "");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("standard");
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authRequiredUrl, setAuthRequiredUrl] = useState<string | null>(null);

  // Form Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Top Pakistan Cities for Quick Selection
  const popularCities = [
    "Lahore",
    "Karachi",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Peshawar",
    "Multan",
    "Sialkot",
    "Gujranwala",
    "Quetta",
    "Hyderabad",
  ];

  const provinces = [
    "Punjab",
    "Sindh",
    "Khyber Pakhtunkhwa",
    "Balochistan",
    "Islamabad Capital Territory",
    "Azad Kashmir",
    "Gilgit-Baltistan",
  ];

  // Fetch verified shipping rates directly from Shopify
  const loadDynamicShippingRates = useCallback(async () => {
    setIsLoadingRates(true);
    try {
      const itemsPayload = cartLines.map((line) => ({
        variantId: line.merchandise.id,
        quantity: line.quantity,
      }));

      const res = await fetch("/api/shopify/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsPayload,
          shippingAddress: {
            city: shippingAddress.city || "Lahore",
            province: shippingAddress.province || "Punjab",
            address1: shippingAddress.address1 || "Main Boulevard",
            postalCode: shippingAddress.postalCode || "54000",
            country: shippingAddress.country || "Pakistan",
          },
          subtotal: cartSubtotal,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.rates && data.rates.length > 0) {
          setShippingOptions(data.rates);
          if (!data.rates.some((r: any) => r.id === selectedShippingId)) {
            setSelectedShippingId(data.rates[0].id);
          }
          setIsLoadingRates(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to load dynamic shipping rates:", err);
    }

    // Default fallback shipping rates calculation if shopify returns empty
    const isFree = cartSubtotal >= 15000;
    const defaultRates: ShippingOption[] = [
      {
        id: "standard",
        title: "Standard Courier Delivery (TCS / Trax / Leopard)",
        price: isFree ? 0 : 250,
        currency: "PKR",
        estimatedDays: "2-4 Business Days",
        description: isFree
          ? "FREE Express delivery on orders above Rs. 15,000"
          : "Flat-rate secure courier delivery across all cities in Pakistan",
      },
      {
        id: "express",
        title: "Priority Air Express Delivery",
        price: isFree ? 250 : 500,
        currency: "PKR",
        estimatedDays: "1-2 Business Days",
        description: "Fast-tracked priority air dispatch with real-time tracking updates",
      },
    ];
    setShippingOptions(defaultRates);
    setIsLoadingRates(false);
  }, [cartLines, cartSubtotal, shippingAddress.city, shippingAddress.province, selectedShippingId]);

  useEffect(() => {
    loadDynamicShippingRates();
  }, [cartSubtotal, shippingAddress.city, shippingAddress.province]);

  // Selected Shipping Rate
  const selectedShipping =
    shippingOptions.find((r) => r.id === selectedShippingId) ||
    shippingOptions[0] || {
      id: "standard",
      title: "Standard Delivery",
      price: cartSubtotal >= 15000 ? 0 : 250,
      currency: "PKR",
      estimatedDays: "2-4 Business Days",
    };

  // Discount Calculation
  const discountAmount =
    discountPercentage > 0 ? Math.round(cartSubtotal * (discountPercentage / 100)) : 0;

  // Final Total
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + selectedShipping.price);

  // Validate form
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!customerData.firstName.trim()) errs.firstName = "First name is required";
    if (!customerData.lastName.trim()) errs.lastName = "Last name is required";

    if (!customerData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!customerData.phone.trim()) {
      errs.phone = "Phone number is required for courier dispatch";
    } else if (customerData.phone.trim().length < 9) {
      errs.phone = "Please enter a valid mobile number (e.g. 0300 1234567)";
    }

    if (!shippingAddress.address1.trim()) {
      errs.address1 = "House/Apartment # and street address is required";
    }
    if (!shippingAddress.city.trim()) {
      errs.city = "City is required";
    }
    if (!shippingAddress.province.trim()) {
      errs.province = "Province is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Place Order Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setAuthRequiredUrl(null);

    if (cartLines.length === 0) {
      setErrorMessage("Your cart is empty. Please add items to proceed.");
      return;
    }

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(`field-${firstErrorField}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      try {
        localStorage.setItem("trt_checkout_customer", JSON.stringify(customerData));
        localStorage.setItem("trt_checkout_address", JSON.stringify(shippingAddress));
      } catch {}

      const itemsPayload = cartLines.map((line) => ({
        variantId: line.merchandise.id,
        quantity: line.quantity,
      }));

      const res = await fetch("/api/shopify/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customerData,
          shippingAddress,
          items: itemsPayload,
          shippingMethodId: selectedShipping.id,
          discountCode: discountAmount > 0 ? discountCode || couponInput : undefined,
          notes: orderNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorText =
          data.error ||
          "We encountered an issue creating your order with Shopify. Please verify your details or try again.";
        setErrorMessage(errorText);
        if (data.authUrl) {
          setAuthRequiredUrl(data.authUrl);
        }
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Order created successfully on Shopify!
      const orderRef = data.orderReference || data.orderNumber;
      clearCart();
      navigateToOrderConfirmation(orderRef);
    } catch (err: any) {
      console.error("Order creation network error:", err);
      setErrorMessage(
        err?.message || "Network connection error. Please check your internet and try again."
      );
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // If cart is empty
  if (cartLines.length === 0) {
    return (
      <div id="checkout-empty-view" className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-slate-900/50">
        <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 mb-6 shadow-xl">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-slate-400 max-w-md text-center mb-8 text-sm">
          You don't have any items in your cart to check out. Browse our collection of premium refurbished and new tech hardware.
        </p>
        <button
          id="btn-checkout-explore"
          onClick={navigateToShop}
          className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Explore Store Catalog
        </button>
      </div>
    );
  }

  return (
    <div id="custom-checkout-page" className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Checkout Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-8">
          <div className="flex items-center gap-4">
            <button
              id="btn-checkout-back-cart"
              type="button"
              onClick={navigateToCart}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-2 text-sm font-medium"
              title="Return to Cart"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Cart</span>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span>Secure Checkout</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase tracking-wider">
                  Cash on Delivery
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Official Headless Storefront for TheReviveTech • Direct Shopify Order Processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-900/90 border border-slate-800/80 px-3.5 py-2 rounded-xl text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div
            id="checkout-error-banner"
            className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm animate-shake"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="font-semibold block text-rose-200">Checkout Notice:</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {authRequiredUrl && (
                <a
                  href={authRequiredUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Connect Shopify App
                </a>
              )}
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-200 text-xs font-semibold px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Checkout Form (8 Cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              {/* Section 1: Customer Contact Information */}
              <div
                id="checkout-section-customer"
                className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800/60">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400" />
                      Customer Contact Details
                    </h2>
                    <p className="text-xs text-slate-400">
                      We'll use this for your order confirmation invoice and courier SMS updates.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div id="field-firstName">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      First Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="input-firstName"
                      type="text"
                      required
                      value={customerData.firstName}
                      onChange={(e) => {
                        setCustomerData({ ...customerData, firstName: e.target.value });
                        if (errors.firstName) setErrors({ ...errors, firstName: "" });
                      }}
                      placeholder="e.g. Bilal"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border ${
                        errors.firstName
                          ? "border-rose-500 ring-1 ring-rose-500"
                          : "border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                      } text-white placeholder-slate-500 text-sm focus:outline-none transition-colors`}
                    />
                    {errors.firstName && (
                      <p className="text-rose-400 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div id="field-lastName">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Last Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="input-lastName"
                      type="text"
                      required
                      value={customerData.lastName}
                      onChange={(e) => {
                        setCustomerData({ ...customerData, lastName: e.target.value });
                        if (errors.lastName) setErrors({ ...errors, lastName: "" });
                      }}
                      placeholder="e.g. Ahmed"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border ${
                        errors.lastName
                          ? "border-rose-500 ring-1 ring-rose-500"
                          : "border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                      } text-white placeholder-slate-500 text-sm focus:outline-none transition-colors`}
                    />
                    {errors.lastName && (
                      <p className="text-rose-400 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div id="field-email" className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        Email Address <span className="text-rose-400">*</span>
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">Order invoice will be sent here</span>
                    </label>
                    <input
                      id="input-email"
                      type="email"
                      required
                      value={customerData.email}
                      onChange={(e) => {
                        setCustomerData({ ...customerData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      placeholder="bilal.ahmed@example.com"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border ${
                        errors.email
                          ? "border-rose-500 ring-1 ring-rose-500"
                          : "border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                      } text-white placeholder-slate-500 text-sm focus:outline-none transition-colors`}
                    />
                    {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone Number */}
                  <div id="field-phone" className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        Mobile / WhatsApp Number <span className="text-rose-400">*</span>
                      </span>
                      <span className="text-[11px] font-normal text-amber-400">Required for courier dispatch call</span>
                    </label>
                    <div className="relative">
                      <input
                        id="input-phone"
                        type="tel"
                        required
                        value={customerData.phone}
                        onChange={(e) => {
                          setCustomerData({ ...customerData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: "" });
                        }}
                        placeholder="0300 1234567 or +92 300 1234567"
                        className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border ${
                          errors.phone
                            ? "border-rose-500 ring-1 ring-rose-500"
                            : "border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                        } text-white placeholder-slate-500 text-sm focus:outline-none transition-colors`}
                      />
                    </div>
                    {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: Shipping / Delivery Address */}
              <div
                id="checkout-section-shipping"
                className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800/60">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      Delivery Address (Pakistan)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Doorstep delivery available across all cities, districts, and tehsils.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Street Address */}
                  <div id="field-address1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Street Address / House / Flat # <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="input-address1"
                      type="text"
                      required
                      value={shippingAddress.address1}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, address1: e.target.value });
                        if (errors.address1) setErrors({ ...errors, address1: "" });
                      }}
                      placeholder="e.g. House 42-B, Sector F-8/2, Street 15"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border ${
                        errors.address1
                          ? "border-rose-500 ring-1 ring-rose-500"
                          : "border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                      } text-white placeholder-slate-500 text-sm focus:outline-none transition-colors`}
                    />
                    {errors.address1 && (
                      <p className="text-rose-400 text-xs mt-1">{errors.address1}</p>
                    )}
                  </div>

                  {/* City with Quick Selection Chips */}
                  <div id="field-city">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      City <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="input-city"
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, city: e.target.value });
                        if (errors.city) setErrors({ ...errors, city: "" });
                      }}
                      placeholder="e.g. Lahore"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border ${
                        errors.city
                          ? "border-rose-500 ring-1 ring-rose-500"
                          : "border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                      } text-white placeholder-slate-500 text-sm focus:outline-none transition-colors`}
                    />
                    {errors.city && <p className="text-rose-400 text-xs mt-1">{errors.city}</p>}

                    {/* Popular City Quick Chips */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] text-slate-400 mr-1">Popular:</span>
                      {popularCities.slice(0, 6).map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setShippingAddress({ ...shippingAddress, city });
                            if (errors.city) setErrors({ ...errors, city: "" });
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                            shippingAddress.city.toLowerCase() === city.toLowerCase()
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Province */}
                    <div id="field-province">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Province / Region <span className="text-rose-400">*</span>
                      </label>
                      <select
                        id="select-province"
                        value={shippingAddress.province}
                        onChange={(e) => {
                          setShippingAddress({ ...shippingAddress, province: e.target.value });
                          if (errors.province) setErrors({ ...errors, province: "" });
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      >
                        {provinces.map((prov) => (
                          <option key={prov} value={prov} className="bg-slate-900 text-white">
                            {prov}
                          </option>
                        ))}
                      </select>
                      {errors.province && (
                        <p className="text-rose-400 text-xs mt-1">{errors.province}</p>
                      )}
                    </div>

                    {/* Postal / ZIP Code */}
                    <div id="field-postalCode">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Postal / ZIP Code (Optional)
                      </label>
                      <input
                        id="input-postalCode"
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                        }
                        placeholder="e.g. 54000"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Special Courier Notes */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Delivery Instructions / Landmark (Optional)
                    </label>
                    <textarea
                      id="input-orderNotes"
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Near Allied Bank, please call before delivery..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Shipping Method Selection */}
              <div
                id="checkout-section-shipping-method"
                className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800/60">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      Shipping & Delivery Options
                    </h2>
                    <p className="text-xs text-slate-400">
                      Real rates calculated directly from active Shopify store logistics configuration.
                    </p>
                  </div>
                </div>

                {isLoadingRates ? (
                  <div className="flex items-center justify-center py-8 text-slate-400 gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    <span className="text-sm">Calculating Shopify shipping rates...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingOptions.map((rate) => {
                      const isSelected = selectedShippingId === rate.id;
                      return (
                        <label
                          key={rate.id}
                          id={`shipping-rate-${rate.id}`}
                          className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-950/50"
                              : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <input
                              type="radio"
                              name="shippingRate"
                              value={rate.id}
                              checked={isSelected}
                              onChange={() => setSelectedShippingId(rate.id)}
                              className="mt-1 text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-sm">{rate.title}</span>
                                {rate.price === 0 && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
                                    FREE
                                  </span>
                                )}
                              </div>
                              {rate.estimatedDays && (
                                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {rate.estimatedDays}
                                </p>
                              )}
                              {rate.description && (
                                <p className="text-xs text-slate-400 mt-1">{rate.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-bold text-sm text-white">
                              {rate.price === 0
                                ? "FREE"
                                : `Rs. ${rate.price.toLocaleString()}`}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 4: Payment Method (Cash on Delivery) */}
              <div
                id="checkout-section-payment"
                className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800/60">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      Payment Method
                    </h2>
                    <p className="text-xs text-slate-400">
                      Pay securely with cash upon delivery at your doorstep.
                    </p>
                  </div>
                </div>

                {/* Cash on Delivery Card */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-2 border-emerald-500/80 shadow-lg relative overflow-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">Cash on Delivery (COD)</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
                            Guaranteed Safe
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          No advance payment or card required. Hand over cash to the courier representative when your parcel arrives.
                        </p>
                      </div>
                    </div>

                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Open Parcel Inspection Available
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" /> 7-Day Replacement Warranty
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Place Order (4 Cols) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-6">
              <div
                id="checkout-order-summary-card"
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md"
              >
                <h3 className="text-lg font-bold text-white pb-4 mb-4 border-b border-slate-800 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold">
                    {cartLines.reduce((sum, item) => sum + item.quantity, 0)} Items
                  </span>
                </h3>

                {/* Items List */}
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 mb-5">
                  {cartLines.map((item) => {
                    const price = parseFloat(item.merchandise.price.amount) || 0;
                    const lineTotal = price * item.quantity;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0"
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative flex items-center justify-center">
                          {item.merchandise.image?.url ? (
                            <img
                              src={item.merchandise.image.url}
                              alt={item.merchandise.product.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-slate-600" />
                          )}
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {item.merchandise.product.title}
                          </h4>
                          {item.merchandise.title && item.merchandise.title !== "Standard" && (
                            <p className="text-[11px] text-slate-400 truncate">
                              {item.merchandise.title}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400">
                            Qty: {item.quantity} × Rs. {price.toLocaleString()}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-white">
                            Rs. {lineTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon / Promo Code */}
                <div className="mb-6 pt-2 border-t border-slate-800">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Promo Code (REVIVE10)"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 uppercase tracking-wider focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => applyDiscountCode(couponInput)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {discountPercentage > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-400 mt-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <span>Discount Applied ({discountPercentage}% OFF)</span>
                      <span className="font-bold">-Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Pricing Calculation Breakdown */}
                <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-semibold text-white">
                      Rs. {cartSubtotal.toLocaleString()}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo Discount</span>
                      <span className="font-semibold">-Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-400">Shipping ({selectedShipping.title})</span>
                    <span className="font-semibold text-white">
                      {selectedShipping.price === 0
                        ? "FREE"
                        : `Rs. ${selectedShipping.price.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Tax</span>
                    <span className="font-semibold text-white">Rs. 0 (Included)</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-extrabold text-white block">Total to Pay</span>
                      <span className="text-[10px] text-slate-400">Payable via Cash on Delivery</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-green-400">
                        Rs. {finalTotal.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                        PKR (Pakistani Rupee)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit / Place Order Button */}
                <div className="mt-6">
                  <button
                    id="btn-place-order"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating Shopify Order...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Place Order (Cash on Delivery)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Safety Guarantee Notice */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 text-center space-y-1">
                  <p className="flex items-center justify-center gap-1.5 text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    100% Genuine Hardware & 7-Day Moneyback
                  </p>
                  <p>By placing this order, your request will be directly transmitted to our official Shopify store.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
