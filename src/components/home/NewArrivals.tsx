import React from "react";
import { useShopify } from "../../context/ShopifyContext";
import { ProductCarousel } from "../common/ProductCarousel";

export const NewArrivals: React.FC = () => {
  const { products, navigateToShop } = useShopify();

  // Show newest products from live Shopify catalog
  const newProducts = [...products].reverse();

  if (newProducts.length === 0) return null;

  return (
    <ProductCarousel
      title="Just Landed Hardware"
      subtitle="Newly stocked original tech peripherals and hardware fresh from factory shipments."
      badgeText="FRESH DROPS"
      products={newProducts}
      onViewAll={navigateToShop}
      viewAllText="View Full Catalog"
    />
  );
};
