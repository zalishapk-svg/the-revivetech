import React from "react";
import { useShopify } from "../../context/ShopifyContext";
import { ProductCarousel } from "../common/ProductCarousel";

export const RecommendationCarousel: React.FC = () => {
  const { products, navigateToShop } = useShopify();

  if (!products || products.length === 0) return null;

  return (
    <ProductCarousel
      title="Personalized Hardware Recommendations"
      subtitle="Curated gaming peripherals selected based on current trending specs and store popularity."
      badgeText="RECOMMENDED FOR YOU"
      products={products}
      onViewAll={navigateToShop}
      viewAllText="View Full Catalog"
    />
  );
};
