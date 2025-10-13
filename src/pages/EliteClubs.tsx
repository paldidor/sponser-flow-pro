import { useEffect } from "react";
import { EliteClubsHero } from "@/components/home/EliteClubsHero";
import { LocalTeamsFeatures } from "@/components/home/LocalTeamsFeatures";
import { LocalTeamsHowItWorks } from "@/components/home/LocalTeamsHowItWorks";
import FAQSection from "@/components/home/FAQSection";
import { Zap, Target, FileCheck, Shield } from 'lucide-react';
import mascotCelebratingJump from "@/assets/images/mascot-celebrating-jump.png";
import profileSetupImage from "@/assets/images/how-it-works-profile.png";
import launchOffersImage from "@/assets/images/how-it-works-launch.png";
import trackManageImage from "@/assets/images/how-it-works-track.png";

const EliteClubs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const eliteClubsFeatures = [
    {
      title: "Automated Setup",
      description: "Generate team profiles and sponsorship packages from your info automatically.",
      icon: Zap
    },
    {
      title: "Smart Sponsor Matching",
      description: "Get matched with sponsorship partners aligned with your club values and goals.",
      icon: Target
    },
    {
      title: "End-to-End Management",
      description: "Track offers, activations, and sponsor deliverables across your teams in one place.",
      icon: FileCheck
    },
    {
      title: "Secure Payments",
      description: "Fast, reliable payments directly to your team — no waiting, no hassle.",
      icon: Shield
    }
  ];

  const eliteClubsSteps = [
    {
      number: "1",
      title: "Create Your Club Account", 
      description: "Enter your website URL & Sponsa will automatically build your profile.",
      imageUrl: profileSetupImage
    },
    {
      number: "2", 
      title: "Launch Sponsorship Offers",
      description: "Upload your sponsorship PDF, URL or answer a few Qs — Sponsa builds and publishes packages fast.",
      imageUrl: launchOffersImage
    },
    {
      number: "3",
      title: "Track & Manage Everything", 
      description: "Track funding, sponsors, activations, and payments in your team portal — no spreadsheets, no stress.",
      imageUrl: trackManageImage
    }
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full">
        <EliteClubsHero />
        <div id="enhanced-features">
          <LocalTeamsFeatures 
            headerText="Everything Elite Clubs Need to Streamline Sponsorships."
            subheaderText="Simplify sponsorships, eliminate admin, and unlock new growth opportunities for your organization."
            features={eliteClubsFeatures}
            customCharacterImage={mascotCelebratingJump}
          />
        </div>
        <div id="sponsa-easy">
          <LocalTeamsHowItWorks steps={eliteClubsSteps} />
        </div>
        <div id="faq">
          <FAQSection showToggle={false} defaultView="teams" />
        </div>
      </div>
    </div>
  );
};

export default EliteClubs;
