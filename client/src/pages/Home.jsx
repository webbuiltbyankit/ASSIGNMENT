import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { CuratedCategoryStrip } from '../components/home/CuratedCategoryStrip';
import { CollectionDiscovery } from '../components/home/CollectionDiscovery';
import { FeaturedRow } from '../components/home/FeaturedRow';
import { EditorialFeature } from '../components/home/EditorialFeature';
import { BrandStorySection, PromoBanner } from '../components/home/BrandStorySection';

export function HomePage() {
  return (
    <div className="forme-home">
      {/* 1. Hero Section (Prompt 04) */}
      <HeroSection
        headline="Wear what moves you"
        subtext="Understated everyday silhouettes, tactile French linen, and tailored outerwear crafted for enduring longevity."
        primaryCtaLabel="Shop The Collection"
        primaryCtaLink="/shop"
        secondaryCtaLabel="Men’s Apparel"
        secondaryCtaLink="/collections/men"
      />

      {/* 2. Curated Category Strip (Prompt 05) */}
      <CuratedCategoryStrip />

      {/* 3. Collection Discovery Panels (Prompt 05) */}
      <CollectionDiscovery />

      {/* 4. Featured Products Row (Prompt 06) */}
      <FeaturedRow
        type="featured"
        eyebrow="Curated Selection"
        title="Featured Garments"
        subtitle="Handpicked essentials embodying our commitment to natural fibers and refined proportions."
        viewAllLink="/shop?sort=featured"
        viewAllText="Explore All Featured"
        limit={4}
      />

      {/* 5. Editorial Wardrobe Story Feature (Prompt 07) */}
      <EditorialFeature
        eyebrow="The Everyday Capsule"
        title="The Warmth of Natural Linen"
        description="From breezy camp collar shirts to pleated wide-leg trousers, our washed European linens drape with relaxed ease and breathe naturally through warm afternoons."
        buttonLabel="Discover Shirts & Trousers"
        buttonLink="/shop?category=shirts"
        assetId="promo-wardrobe-01"
        altText="Editorial shot of model walking in relaxed everyday wardrobe"
        reverse={false}
      />

      {/* 6. Promotional Capsule Banner (Prompt 07) */}
      <PromoBanner />

      {/* 7. New Arrivals Row (Prompt 06) */}
      <FeaturedRow
        type="newArrivals"
        eyebrow="Recent Additions"
        title="New Seasonal Arrivals"
        subtitle="Fresh cuts and updated textures introduced for the current season."
        viewAllLink="/shop?sort=newest"
        viewAllText="View New Arrivals"
        limit={4}
      />

      {/* 8. Brand Story & Craftsmanship Pillars (Prompt 07) */}
      <BrandStorySection />
    </div>
  );
}
