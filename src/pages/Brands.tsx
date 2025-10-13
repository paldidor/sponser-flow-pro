import { Zap, Target, FileCheck, Shield, Store, TrendingUp } from 'lucide-react';
import { BrandsHero } from "@/components/home/BrandsHero";
import { LocalTeamsFeatures } from "@/components/home/LocalTeamsFeatures";
import { LocalTeamsHowItWorks } from "@/components/home/LocalTeamsHowItWorks";
import FAQSection from "@/components/home/FAQSection";
import discoverTeamsImage from '@/assets/images/brands-discover-teams.png';
import launchCampaignsImage from '@/assets/images/brands-launch-campaigns.png';
import trackPerformanceImage from '@/assets/images/brands-track-performance.png';

const brandsFeatures = [
  {
    title: "Automated Setup",
    description: "Generate team profiles and sponsorship packages from your info automatically.",
    icon: Zap
  },
  {
    title: "Smart Sponsor Matching",
    description: "Get matched with sponsorship opportunities aligned with your goals.",
    icon: Target
  },
  {
    title: "Marketplace",
    description: "Explore and filter through opportunities based on location, sport and sponsorship type.",
    icon: Store
  },
  {
    title: "End-to-End Management",
    description: "Create, launch, and manage sponsorship campaigns at scale across multiple teams and regions — all from a single point.",
    icon: FileCheck
  },
  {
    title: "Reporting & Insights",
    description: "Get insights, measure reach, engagement, and impact to understand what's driving performance.",
    icon: TrendingUp
  },
  {
    title: "Secure Payments",
    description: "Fast, reliable payments directly to your team — no waiting, no hassle.",
    icon: Shield
  }
];

const brandsHeader = "Everything Brands Need to Activate Sponsorships at Scale.";
const brandsSubheader = "Turn youth sports sponsorships into a scalable, measurable and seamless community marketing channel that creates real impact.";

const brandsSteps = [
  {
    number: "1",
    title: "Discover Youth Teams",
    description: "Explore and filter verified teams in the marketplace or get auto-matched according to your goals.",
    imageUrl: discoverTeamsImage
  },
  {
    number: "2",
    title: "Launch Campaigns Fast",
    description: "Select sponsorship packages, get approved and start activating your brand across communities.",
    imageUrl: launchCampaignsImage
  },
  {
    number: "3",
    title: "Track Performance & Impact",
    description: "Complete activation tasks, monitor campaigns, and access sponsorship analytics and insights.",
    imageUrl: trackPerformanceImage
  }
];

export default function Brands() {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full">
        <BrandsHero />
        <div id="enhanced-features">
          <LocalTeamsFeatures 
            features={brandsFeatures} 
            headerText={brandsHeader}
            subheaderText={brandsSubheader}
            highlightWord="Scale"
            gridCols="three"
          />
        </div>
        <div id="sponsa-easy">
          <LocalTeamsHowItWorks steps={brandsSteps} />
        </div>
        <div id="faq">
          <FAQSection showToggle={false} defaultView="brands" />
        </div>
      </div>
    </div>
  );
}
