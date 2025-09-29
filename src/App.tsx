import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LandingPage from "./components/LandingPage";
import AuthFlow from "./components/AuthFlow";
import CongratulationsScreen from "./components/CongratulationsScreen";
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

  // Mock team data after profile review
  const mockTeamData: TeamProfile = {
    name: "Lightning Bolts Soccer Club",
    bio: "The Lightning Bolts Soccer Club is a competitive youth soccer team based in downtown. We compete in the regional youth league and focus on developing both athletic skills and character in our players aged 10-14.",
    location: "San Francisco, CA",
    images: [
      "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
    ],
    socialStats: {
      instagram: 1250,
      facebook: 890,
      twitter: 420,
    },
    playerCount: 18,
    sport: "Soccer",
    emailListSize: 0,
    competitionLevel: "regional",
    organizationStatus: "nonprofit",
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
    setCurrentStep("congratulations");
  };

  const handleProfileComplete = () => {
    setTeamData(mockTeamData);
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
        setCurrentStep("congratulations");
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

  useEffect(() => {
    if (currentStep === "congratulations") {
      // Profile complete is called from CongratulationsScreen after timeout
    }
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case "landing":
        return <LandingPage onGetStarted={handleGetStarted} />;
      case "auth":
        return <AuthFlow onAuthComplete={handleAuthComplete} onBack={handleBack} />;
      case "congratulations":
        return <CongratulationsScreen onContinue={handleProfileComplete} />;
      case "profile-review":
        return <ProfileReview teamData={teamData} onApprove={handleProfileApprove} />;
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
