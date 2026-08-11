import React from "react";
import { HeroSlider } from "./HeroSlider";
import { SecondSlider } from "./SecondSlider";
import { SingleBanner } from "./SingleBanner";
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
      {/* Top Hero Slider (3 Slides) */}
      <HeroSlider />

      {/* Second Full-Width Slider (2 Slides) */}
      <SecondSlider />

      {/* Full-Width Single Banner (Govee) */}
      <SingleBanner />

      {/* Trending Categories */}
      <TrendingCategories />

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* Best Sellers */}
      <BestSellers />

      {/* Promotional Banner with Selective Yellow Tape Highlight */}
      <PromotionalBanner />

      {/* Tech Categories Slider */}
      <TechCategoriesSlider />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Gaming Setup Interactive Hotspots */}
      <GamingSetupShowcase />

      {/* Featured Brands & Brand Logo Marquee */}
      <BrandMarquee />

      {/* Flash Deals & Live Countdown Timer */}
      <FlashDeals />

      {/* Recommendation Carousel */}
      <RecommendationCarousel />

      {/* Frequently Bought Together Bundle Builder */}
      <FrequentlyBoughtTogether />

      {/* Tech Showcase Spec Breakdown */}
      <TechShowcase />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Animated Statistics */}
      <AnimatedStatistics />

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* Community Battlestation Stories */}
      <CommunityStories />

      {/* Buying Guides */}
      <BuyingGuides />

      {/* Latest Technology Blog */}
      <LatestBlog />

      {/* FAQ Accordion */}
      <FAQSection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
};
