import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
    // Don't set mock data - let ProfileReview fetch from database
    setTeamData(null);
    setIsManualEntry(false);
    setCurrentStep("profile-review");
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

  const handlePDFUpload = async (fileName: string, publicUrl: string) => {
    setAnalysisFileName(fileName);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in");
      }

      // Store PDF reference in database for Make.com to process
      const { error: insertError } = await supabase
        .from('sponsorship_offers')
        .insert({
          user_id: user.id,
          team_profile_id: null,
          title: `Sponsorship from ${fileName}`,
          fundraising_goal: 0,
          impact: 'Pending analysis from PDF',
          supported_players: 0,
          duration: 'Pending',
          description: 'This sponsorship offer will be analyzed from the uploaded PDF',
          status: 'draft',
          source: 'pdf',
          source_file_name: fileName,
          pdf_public_url: publicUrl,
          analysis_status: 'pending'
        });

      if (insertError) throw insertError;

      // Set placeholder data for review - Make.com will update this later
      setSponsorshipData({
        fundraisingGoal: "0",
        duration: "Pending Analysis",
        description: "PDF uploaded successfully. Make.com will analyze this file and populate the sponsorship details.",
        packages: [],
        source: "pdf",
        fileName,
      });

      setCurrentStep("sponsorship-review");
    } catch (error) {
      console.error('PDF upload error:', error);
      setSponsorshipData({
        fundraisingGoal: "0",
        duration: "Annual",
        description: "Failed to save PDF reference. Please try again.",
        packages: [],
        source: "pdf",
        fileName,
      });
      setCurrentStep("sponsorship-review");
    }
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
