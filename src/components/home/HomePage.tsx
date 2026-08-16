import React from "react";
import { HeroSlider } from "./HeroSlider";
import { FeaturedProducts } from "./FeaturedProducts";
import { TrendingCategories } from "./TrendingCategories";
import { SecondSlider } from "./SecondSlider";
import { DynamicCollectionSections } from "./DynamicCollectionSections";
import { NewArrivals } from "./NewArrivals";
import { FlashDeals } from "./FlashDeals";
import { SingleBanner } from "./SingleBanner";
import { PromotionalMarquee } from "./PromotionalMarquee";
import { CustomerReviews } from "./CustomerReviews";
import { CommunityStories } from "./CommunityStories";
import { LatestBlog } from "./LatestBlog";
import { WhyChooseUs } from "./WhyChooseUs";
import { FAQSection } from "./FAQSection";

export const HomePage: React.FC = () => {
  return (
    <div className="w-full bg-[#161616] text-slate-100">
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

      {/* 5. PROMOTIONAL SLIDER (Second Slider: EasySMX & Andaseat) */}
      <SecondSlider />

      {/* 6. JUST LANDED HARDWARE */}
      <NewArrivals />

      {/* 7. FLASH SALE HARDWARE */}
      <FlashDeals />

      {/* 8. SOLO IMAGE SLIDER (Moved immediately below Flash Sale Hardware) */}
      <SingleBanner />

      {/* Dynamic Shopify Collection Product Carousels - Batch 2 */}
      <DynamicCollectionSections startIndex={3} count={3} />

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

