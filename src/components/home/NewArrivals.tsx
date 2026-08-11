import React from "react";
import { useShopify } from "../../context/ShopifyContext";
import { ProductCarousel } from "../common/ProductCarousel";

export const NewArrivals: React.FC = () => {
  const { products, isLoadingData, navigateToShop } = useShopify();

  // Show newest products from live Shopify catalog
  const newProducts = [...products].reverse();

  return (
    <ProductCarousel
      title="Just Landed Hardware"
      subtitle="Newly stocked original tech peripherals and hardware fresh from factory shipments."
      badgeText="FRESH DROPS"
      products={newProducts}
      isLoading={isLoadingData}
      onViewAll={navigateToShop}
      viewAllText="View Full Catalog"
    />
  );
};
