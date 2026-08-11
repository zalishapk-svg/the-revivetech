import React from "react";
import { useShopify } from "../../context/ShopifyContext";
import { ProductCarousel } from "../common/ProductCarousel";

export const FeaturedProducts: React.FC = () => {
  const { products, navigateToShop } = useShopify();

  if (!products || products.length === 0) return null;

  return (
    <ProductCarousel
      title="Featured Products"
      subtitle="Top performing authentic gaming hardware and high-precision peripherals."
      badgeText="FLAGSHIP GEAR"
      products={products}
      onViewAll={navigateToShop}
      viewAllText="View Full Catalog"
    />
  );
};
