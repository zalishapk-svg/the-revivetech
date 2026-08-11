import React from "react";
import { useShopify } from "../../context/ShopifyContext";
import { ProductCarousel } from "../common/ProductCarousel";

interface DynamicCollectionSectionsProps {
  startIndex?: number;
  count?: number;
}

export const DynamicCollectionSections: React.FC<DynamicCollectionSectionsProps> = ({
  startIndex = 0,
  count = 4,
}) => {
  const { collections, navigateToCollection } = useShopify();

  if (!collections || collections.length === 0) return null;

  // Filter collections that actually contain products
  const activeCollections = collections.filter(
    (col) => col.products && col.products.length > 0
  );

  const selectedCollections = activeCollections.slice(startIndex, startIndex + count);

  if (selectedCollections.length === 0) return null;

  return (
    <div className="space-y-4">
      {selectedCollections.map((col) => {
        const productCount = col.productsCount || col.products?.length || 0;
        return (
          <ProductCarousel
            key={col.id}
            title={col.title}
            badgeText={`${productCount} ITEMS`}
            products={col.products || []}
            onViewAll={() => navigateToCollection(col.handle)}
            viewAllText={`Explore ${col.title}`}
          />
        );
      })}
    </div>
  );
};
