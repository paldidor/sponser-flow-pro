import { useEffect } from "react";
import { LocalTeamsBenefits } from "@/components/home/LocalTeamsBenefits";
import { LocalTeamsFeatures } from "@/components/home/LocalTeamsFeatures";
import { LocalTeamsHowItWorks } from "@/components/home/LocalTeamsHowItWorks";
import FAQSection from "@/components/home/FAQSection";
import mascotCelebratingJump from "@/assets/images/mascot-celebrating-jump.png";

const LocalTeams = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full">
        <LocalTeamsBenefits />
        <div id="features">
          <LocalTeamsFeatures customCharacterImage={mascotCelebratingJump} />
        </div>
        <div id="how-it-works">
          <LocalTeamsHowItWorks />
        </div>
        <div id="faq">
          <FAQSection showToggle={false} defaultView="teams" />
        </div>
      </div>
    </div>
  );
};

export default LocalTeams;
