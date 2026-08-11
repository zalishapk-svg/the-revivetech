import React from "react";
import { useShopify } from "../../context/ShopifyContext";
import { ProductCarousel } from "../common/ProductCarousel";

export const FeaturedProducts: React.FC = () => {
  const { products, isLoadingData, navigateToShop } = useShopify();

  return (
    <ProductCarousel
      title="Featured Products"
      subtitle="Top performing authentic gaming hardware and high-precision peripherals."
      badgeText="FLAGSHIP GEAR"
      products={products}
      isLoading={isLoadingData}
      onViewAll={navigateToShop}
      viewAllText="View Full Catalog"
    />
  );
};
