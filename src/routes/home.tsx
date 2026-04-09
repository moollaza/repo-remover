import { CTASection } from "@/components/landing/cta-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { GetStartedSection } from "@/components/landing/get-started-section";
import { HeroSection } from "@/components/landing/hero-section";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { TestimonialsSection } from "@/components/landing/testimonials-section";

export function Home() {
  return (
    <>
      <HeroSection />
      <ProductShowcase />
      <FeaturesSection />
      <TestimonialsSection />
      <GetStartedSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
