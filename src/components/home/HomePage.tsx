import React from "react";
import { HeroSlider } from "./HeroSlider";
import { TrendingCategories } from "./TrendingCategories";
import { FeaturedCollections } from "./FeaturedCollections";
import { BestSellers } from "./BestSellers";
import { PromotionalBanner } from "./PromotionalBanner";
import { TechCategoriesSlider } from "./TechCategoriesSlider";
import { NewArrivals } from "./NewArrivals";
import { GamingSetupShowcase } from "./GamingSetupShowcase";
import { BrandMarquee } from "./BrandMarquee";
import { FlashDeals } from "./FlashDeals";
import { RecommendationCarousel } from "./RecommendationCarousel";
import { FrequentlyBoughtTogether } from "./FrequentlyBoughtTogether";
import { TechShowcase } from "./TechShowcase";
import { WhyChooseUs } from "./WhyChooseUs";
import { AnimatedStatistics } from "./AnimatedStatistics";
import { CustomerReviews } from "./CustomerReviews";
import { CommunityStories } from "./CommunityStories";
import { BuyingGuides } from "./BuyingGuides";
import { LatestBlog } from "./LatestBlog";
import { FAQSection } from "./FAQSection";
import { NewsletterSection } from "./NewsletterSection";

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      {/* 1 & 2: AnnouncementBar & Header are rendered in App layout */}
      {/* 3: SLIDER 1 — Hero Slider */}
      <HeroSlider />

      {/* 4: Trending Categories */}
      <TrendingCategories />

      {/* 5: Featured Collections */}
      <FeaturedCollections />

      {/* 6: Best Sellers */}
      <BestSellers />

      {/* 7: Promotional Banner with Selective Yellow Tape Highlight */}
      <PromotionalBanner />

      {/* 8: SLIDER 2 — Tech Categories Slider */}
      <TechCategoriesSlider />

      {/* 9: New Arrivals */}
      <NewArrivals />

      {/* 10: Gaming Setup Interactive Hotspots */}
      <GamingSetupShowcase />

      {/* 11 & 12: Featured Brands & Brand Logo Marquee */}
      <BrandMarquee />

      {/* 13 & 14: Flash Deals & Live Countdown Timer */}
      <FlashDeals />

      {/* 15: SLIDER 3 — Recommendation Carousel */}
      <RecommendationCarousel />

      {/* 16: Frequently Bought Together Bundle Builder */}
      <FrequentlyBoughtTogether />

      {/* 17: Tech Showcase Spec Breakdown */}
      <TechShowcase />

      {/* 18: Why Choose Us */}
      <WhyChooseUs />

      {/* 19: Animated Statistics */}
      <AnimatedStatistics />

      {/* 20: Customer Reviews */}
      <CustomerReviews />

      {/* 21: SLIDER 4 — Community Battlestation Stories */}
      <CommunityStories />

      {/* 22: Buying Guides */}
      <BuyingGuides />

      {/* 23: Latest Technology Blog */}
      <LatestBlog />

      {/* 24: FAQ Accordion */}
      <FAQSection />

      {/* 25 & 26: Newsletter Section */}
      <NewsletterSection />
    </div>
  );
};
