import HeroSection from "@/components/home/HeroSection";
import WhyItMattersSection from "@/components/home/WhyItMattersSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ProductSection from "@/components/home/ProductSection";
import BlogSection from "@/components/home/BlogSection";
import FAQSection from "@/components/home/FAQSection";
import CommunitySection from "@/components/home/CommunitySection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <WhyItMattersSection />
      <HowItWorksSection />
      <ProductSection />
      <BlogSection />
      <FAQSection />
      <CommunitySection />
      <CTASection />
    </div>
  );
};

export default Index;
