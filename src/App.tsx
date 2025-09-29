import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LandingPage from "./components/LandingPage";
import AuthFlow from "./components/AuthFlow";
import CreateTeamProfile from "./components/CreateTeamProfile";
import ProfileReview from "./components/ProfileReview";
import CreateSponsorshipOffer from "./components/CreateSponsorshipOffer";
import SponsorshipForm from "./components/SponsorshipForm";
import WebsiteAnalysisInput from "./components/WebsiteAnalysisInput";
import AnalysisSpinner from "./components/AnalysisSpinner";
import PDFUploadInput from "./components/PDFUploadInput";
import SponsorshipReview from "./components/SponsorshipReview";
import SponsorshipMarketplace from "./components/SponsorshipMarketplace";
import { FlowStep, TeamProfile, SponsorshipData, SponsorshipPackage } from "./types/flow";

const queryClient = new QueryClient();

const App = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("landing");
  const [teamData, setTeamData] = useState<TeamProfile | null>(null);
  const [sponsorshipData, setSponsorshipData] = useState<SponsorshipData | null>(null);
  const [analysisFileName, setAnalysisFileName] = useState<string>("");
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Mock team data after website analysis
  const mockTeamData: TeamProfile = {
    team_name: "Lightning Bolts Soccer Club",
    main_values: ["Teamwork", "Excellence", "Community"],
    location: "San Francisco, CA",
    team_bio: "The Lightning Bolts Soccer Club is a competitive youth soccer team based in downtown. We compete in the regional youth league and focus on developing both athletic skills and character in our players aged 10-14.",
    sport: "Soccer",
    number_of_players: "18",
    level_of_play: "Competitive",
    competition_scope: "Regional",
    season_start_date: "2024-03-01",
    season_end_date: "2024-11-30",
    organization_status: "nonprofit",
    instagram_followers: 1250,
    facebook_followers: 890,
    twitter_followers: 420,
    email_list_size: 0,
    images: [
      "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
    ],
  };

  // Mock sponsorship packages
  const mockSponsorshipPackages: SponsorshipPackage[] = [
    {
      id: "1",
      name: "Bronze Supporter",
      price: 500,
      benefits: [
        "Team website logo placement",
        "1 social media mention per month",
        "Thank you certificate",
        "Season schedule card with logo"
      ],
      placements: ["Website", "Social Media"],
    },
    {
      id: "2",
      name: "Silver Sponsor",
      price: 1500,
      benefits: [
        "Uniform back name placement",
        "Field banner display",
        "2 social media posts per month",
        "Email newsletter inclusion",
        "Team photo with banner",
        "Business discount codes shared"
      ],
      placements: ["Uniform", "Field", "Social Media", "Email"],
    },
    {
      id: "3",
      name: "Gold Partner",
      price: 3000,
      benefits: [
        "Logo on game uniforms",
        "Team banner",
        "Website listing",
        "4 social media posts per month",
        "Premium event tickets",
        "Exclusive sponsor meet and greet"
      ],
      placements: ["Uniform", "Field", "Website", "Social Media"],
    },
  ];

  const handleGetStarted = () => {
    setCurrentStep("auth");
  };

  const handleAuthComplete = () => {
    setCurrentStep("create-profile");
  };

  const handleAnalyzeWebsite = (url: string) => {
    // Simulate website analysis
    setTimeout(() => {
      setTeamData(mockTeamData);
      setIsManualEntry(false);
      setCurrentStep("profile-review");
    }, 2000);
  };

  const handleFillManually = () => {
    setTeamData(null);
    setIsManualEntry(true);
    setCurrentStep("profile-review");
  };

  const handleProfileApprove = () => {
    setCurrentStep("create-offer");
  };

  const handleSelectMethod = (method: "form" | "website" | "pdf", url?: string) => {
    if (method === "form") {
      setCurrentStep("form");
    } else if (method === "website") {
      if (url && url.trim()) {
        // If URL provided, go straight to analysis
        setCurrentStep("website-analysis");
        setTimeout(() => {
          const mockData: SponsorshipData = {
            fundraisingGoal: "8000",
            duration: "Annual",
            description: "Comprehensive sponsorship opportunities for our competitive youth sports program.",
            packages: mockSponsorshipPackages,
            source: "website",
            sourceUrl: url,
          };
          setSponsorshipData(mockData);
          setCurrentStep("sponsorship-review");
        }, 2500);
      } else {
        setCurrentStep("website-input");
      }
    } else {
      setCurrentStep("pdf-input");
    }
  };

  const handleWebsiteAnalyze = (url: string) => {
    setCurrentStep("website-analysis");
    setTimeout(() => {
      const mockData: SponsorshipData = {
        fundraisingGoal: "8000",
        duration: "Annual",
        description: "Comprehensive sponsorship opportunities for our competitive youth sports program.",
        packages: mockSponsorshipPackages,
        source: "website",
        sourceUrl: url,
      };
      setSponsorshipData(mockData);
      setCurrentStep("sponsorship-review");
    }, 2500);
  };

  const handlePDFUpload = (fileName: string) => {
    setAnalysisFileName(fileName);
    setCurrentStep("pdf-analysis");
    setTimeout(() => {
      const mockData: SponsorshipData = {
        fundraisingGoal: "8000",
        duration: "Annual",
        description: "Comprehensive sponsorship opportunities for our competitive youth sports program.",
        packages: mockSponsorshipPackages,
        source: "pdf",
        fileName: fileName,
      };
      setSponsorshipData(mockData);
      setCurrentStep("sponsorship-review");
    }, 3000);
  };

  const handleFormComplete = (data: SponsorshipData) => {
    setSponsorshipData(data);
    setCurrentStep("sponsorship-review");
  };

  const handleReviewApprove = () => {
    setCurrentStep("marketplace");
  };

  const handleBack = () => {
    switch (currentStep) {
      case "auth":
        setCurrentStep("landing");
        break;
      case "profile-review":
        setCurrentStep("create-profile");
        break;
      case "form":
      case "website-input":
      case "pdf-input":
        setCurrentStep("create-offer");
        break;
      case "sponsorship-review":
        if (sponsorshipData?.source === "form") {
          setCurrentStep("form");
        } else if (sponsorshipData?.source === "website") {
          setCurrentStep("website-input");
        } else {
          setCurrentStep("pdf-input");
        }
        break;
      default:
        break;
    }
  };


  const renderStep = () => {
    switch (currentStep) {
      case "landing":
        return <LandingPage onGetStarted={handleGetStarted} />;
      case "auth":
        return <AuthFlow onAuthComplete={handleAuthComplete} onBack={handleBack} />;
      case "create-profile":
        return <CreateTeamProfile onAnalyzeWebsite={handleAnalyzeWebsite} onFillManually={handleFillManually} />;
      case "profile-review":
        return <ProfileReview teamData={teamData} onApprove={handleProfileApprove} isManualEntry={isManualEntry} />;
      case "create-offer":
        return <CreateSponsorshipOffer onSelectMethod={handleSelectMethod} />;
      case "form":
        return <SponsorshipForm onComplete={handleFormComplete} onBack={handleBack} />;
      case "website-input":
        return <WebsiteAnalysisInput onAnalyze={handleWebsiteAnalyze} onBack={handleBack} />;
      case "website-analysis":
        return <AnalysisSpinner type="website" />;
      case "pdf-input":
        return <PDFUploadInput onUpload={handlePDFUpload} onBack={handleBack} />;
      case "pdf-analysis":
        return <AnalysisSpinner type="pdf" fileName={analysisFileName} />;
      case "sponsorship-review":
        return (
          <SponsorshipReview
            sponsorshipData={sponsorshipData!}
            teamData={teamData}
            onApprove={handleReviewApprove}
            onBack={handleBack}
          />
        );
      case "marketplace":
        return (
          <SponsorshipMarketplace
            sponsorshipData={sponsorshipData!}
            teamData={teamData}
          />
        );
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {renderStep()}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
