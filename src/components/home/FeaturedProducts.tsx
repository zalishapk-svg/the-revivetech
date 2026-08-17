import React, { useState, useEffect } from "react";
import { useShopify } from "../../context/ShopifyContext";
import { ProductCarousel } from "../common/ProductCarousel";
import { getCollectionByHandleFromShopify } from "../../lib/shopify";
import { Product } from "../../types";

export const FeaturedProducts: React.FC = () => {
  const { collections, isLoadingData, navigateToCollection } = useShopify();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingCollection, setIsLoadingCollection] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchFeaturesProducts() {
      // Check if features collection is already in context with products
      const contextCollection = collections.find(
        (c) => c.handle.toLowerCase() === "features" && c.products && c.products.length > 0
      );

      if (contextCollection && contextCollection.products && contextCollection.products.length > 0) {
        if (isMounted) {
          setFeaturedProducts(contextCollection.products);
          setIsLoadingCollection(false);
        }
      }

      // Dynamically fetch from Shopify collection 'features'
      try {
        setIsLoadingCollection(true);
        const { collection } = await getCollectionByHandleFromShopify("features", { first: 30 });
        if (isMounted && collection && collection.products && collection.products.length > 0) {
          setFeaturedProducts(collection.products);
        }
      } catch (error) {
        console.error("Error fetching features collection for Featured Products:", error);
      } finally {
        if (isMounted) {
          setIsLoadingCollection(false);
        }
      }
    }

    fetchFeaturesProducts();

    return () => {
      isMounted = false;
    };
  }, [collections]);

  return (
    <ProductCarousel
      title="Featured Products"
      subtitle="Top performing authentic gaming hardware and high-precision peripherals."
      badgeText="FLAGSHIP GEAR"
      products={featuredProducts}
      isLoading={isLoadingData || (isLoadingCollection && featuredProducts.length === 0)}
      onViewAll={() => navigateToCollection("features")}
      viewAllText="View Features Collection"
    />
  );
};

