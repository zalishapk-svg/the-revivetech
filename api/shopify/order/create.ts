import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getConfig,
  validateShopifyCartItems,
  createShopifyAdminOrder,
  calculateShippingRates,
} from "../../_lib/shopify-server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { customer, shippingAddress, items, shippingMethodId, discountCode, notes } = req.body || {};

    // 1. Validate Customer Data
    if (!customer?.firstName?.trim() || !customer?.lastName?.trim()) {
      return res.status(400).json({ error: "First and last name are required." });
    }
    if (!customer?.email?.trim() || !customer.email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required for order confirmation." });
    }
    if (!customer?.phone?.trim() || customer.phone.trim().length < 8) {
      return res.status(400).json({ error: "A valid phone number is required for Cash on Delivery dispatch." });
    }

    // 2. Validate Shipping Address
    if (!shippingAddress?.address1?.trim()) {
      return res.status(400).json({ error: "Street address is required." });
    }
    if (!shippingAddress?.city?.trim()) {
      return res.status(400).json({ error: "City is required." });
    }
    if (!shippingAddress?.province?.trim()) {
      return res.status(400).json({ error: "Province/State is required." });
    }

    // 3. Validate Cart Line Items & Inventory directly against live Shopify database
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Your shopping cart is empty." });
    }

    const config = getConfig();
    const inventoryResult = await validateShopifyCartItems(items, config.storeDomain);

    if (!inventoryResult.valid || !inventoryResult.validatedItems.length) {
      return res.status(400).json({
        error: inventoryResult.error || "One or more items in your cart could not be verified.",
        code: "INVENTORY_ERROR",
      });
    }

    // 4. Calculate Server-Side Subtotal & Verified Shipping Rates
    const validatedSubtotal = inventoryResult.subtotal;
    const availableShippingRates = calculateShippingRates(validatedSubtotal);

    const selectedRate =
      availableShippingRates.find((r) => r.id === shippingMethodId) || availableShippingRates[0];

    // 5. Calculate Verified Discounts
    let discountAmount = 0;
    const upperCode = (discountCode || "").trim().toUpperCase();
    if (upperCode === "REVIVE10" || upperCode === "WELCOME10") {
      discountAmount = Math.round(validatedSubtotal * 0.1);
    } else if (upperCode === "REVIVE5") {
      discountAmount = Math.round(validatedSubtotal * 0.05);
    }

    // 6. Create Real Order on Shopify via Admin API
    const orderCreationResult = await createShopifyAdminOrder({
      customer: {
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
      shippingAddress: {
        address1: shippingAddress.address1.trim(),
        city: shippingAddress.city.trim(),
        province: shippingAddress.province.trim(),
        postalCode: (shippingAddress.postalCode || "").trim() || "00000",
        country: (shippingAddress.country || "Pakistan").trim(),
      },
      validatedItems: inventoryResult.validatedItems,
      shippingMethod: {
        title: selectedRate.title,
        price: selectedRate.price,
        code: selectedRate.id.toUpperCase(),
      },
      discountCode: discountAmount > 0 ? upperCode : undefined,
      discountAmount,
      notes: notes?.trim(),
      storeDomain: config.storeDomain,
    });

    if (!orderCreationResult.success) {
      return res.status(500).json({
        error: orderCreationResult.error || "Failed to create order on Shopify Admin API.",
      });
    }

    return res.status(200).json({
      success: true,
      orderReference: orderCreationResult.orderReference,
      orderNumber: orderCreationResult.orderNumber,
      shopifyOrderId: orderCreationResult.shopifyOrderId,
      totalPrice: orderCreationResult.totalPrice,
      currency: orderCreationResult.currency,
      orderData: orderCreationResult.orderData,
    });
  } catch (error: any) {
    console.error("[Create Order API Exception]", error);
    return res.status(500).json({
      error: error?.message || "Internal server error during order creation.",
    });
  }
}
