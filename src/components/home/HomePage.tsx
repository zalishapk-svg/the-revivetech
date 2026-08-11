import React from "react";
import { HeroSlider } from "./HeroSlider";
import { FeaturedProducts } from "./FeaturedProducts";
import { TrendingCategories } from "./TrendingCategories";
import { TechCategoriesSlider } from "./TechCategoriesSlider";
import { SecondSlider } from "./SecondSlider";
import { DynamicCollectionSections } from "./DynamicCollectionSections";
import { NewArrivals } from "./NewArrivals";
import { FlashDeals } from "./FlashDeals";
import { SingleBanner } from "./SingleBanner";
import { PromotionalMarquee } from "./PromotionalMarquee";
import { RecommendationCarousel } from "./RecommendationCarousel";
import { FrequentlyBoughtTogether } from "./FrequentlyBoughtTogether";
import { CustomerReviews } from "./CustomerReviews";
import { CommunityStories } from "./CommunityStories";
import { LatestBlog } from "./LatestBlog";
import { WhyChooseUs } from "./WhyChooseUs";
import { FAQSection } from "./FAQSection";

export const HomePage: React.FC = () => {
  return (
    <div className="w-full bg-slate-950 text-slate-100">
      {/* 1. HERO SLIDER */}
      <HeroSlider />

      {/* Promotional Green Tilted Marquee Banner */}
      <PromotionalMarquee />

      {/* 2. FEATURED PRODUCTS */}
      <FeaturedProducts />

      {/* 3. TRENDING HARDWARE CATEGORIES */}
      <TrendingCategories />

      {/* Dynamic Shopify Collection Product Carousels - Batch 1 */}
      <DynamicCollectionSections startIndex={0} count={3} />

      {/* 4. TECHNOLOGY HARDWARE SPECTRUM */}
      <TechCategoriesSlider />

      {/* 5. PROMOTIONAL SLIDER (Second Slider: EasySMX & Andaseat) */}
      <SecondSlider />

      {/* 6. JUST LANDED HARDWARE */}
      <NewArrivals />

      {/* 7. FLASH SALE */}
      <FlashDeals />

      {/* Dynamic Shopify Collection Product Carousels - Batch 2 */}
      <DynamicCollectionSections startIndex={3} count={3} />

      {/* 8. PROMOTIONAL SLIDER (Govee Single Banner) */}
      <SingleBanner />

      {/* 9. PERSONALIZED HARDWARE RECOMMENDATIONS */}
      <RecommendationCarousel />

      {/* 10. FREQUENTLY BOUGHT TOGETHER */}
      <FrequentlyBoughtTogether />

      {/* Why Choose Us Trust Badges */}
      <WhyChooseUs />

      {/* 11. CUSTOMER REVIEWS */}
      <CustomerReviews />

      {/* 12. COMMUNITY SETUP GALLERY */}
      <CommunityStories />

      {/* 13. BLOGS */}
      <LatestBlog />

      {/* FAQ Accordion */}
      <FAQSection />
    </div>
  );
};
