import HeroSection from "@/components/home/HeroSection";
import WhyItMattersSection from "@/components/home/WhyItMattersSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ProductSection from "@/components/home/ProductSection";
import CommunitySection from "@/components/home/CommunitySection";
import CTASection from "@/components/home/CTASection";
import BlogSection from "@/components/home/BlogSection";
import FAQSection from "@/components/home/FAQSection";

const Index = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <WhyItMattersSection />
      <HowItWorksSection />
      <ProductSection />
      <CommunitySection />
      <CTASection />
      <BlogSection />
      <FAQSection />
    </div>
  );
};

export default Index;
