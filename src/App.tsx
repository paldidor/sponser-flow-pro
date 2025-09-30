import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handlePDFUpload = async (fileUrl: string, fileName: string) => {
    setAnalysisFileName(fileName);
    setCurrentStep("pdf-analysis");

    try {
      // Create sponsorship offer record first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: offerData, error: offerError } = await supabase
        .from('sponsorship_offers')
        .insert({
          user_id: user.id,
          title: `Sponsorship from ${fileName}`,
          fundraising_goal: 0,
          duration: 'TBD',
          impact: 'Analysis in progress...',
          pdf_public_url: fileUrl,
          source_file_name: fileName,
          analysis_status: 'pending',
          source: 'pdf',
          status: 'draft'
        })
        .select()
        .single();

      if (offerError) throw offerError;

      setCurrentOfferId(offerData.id);

      // Call edge function to analyze PDF (async - doesn't wait for completion)
      supabase.functions.invoke('analyze-pdf-sponsorship', {
        body: {
          pdfUrl: fileUrl,
          offerId: offerData.id,
          userId: user.id
        }
      }).then(({ error }) => {
        if (error) {
          console.error('Edge function invocation error:', error);
        }
      });

      // Start polling for analysis status
      pollAnalysisStatus(offerData.id, fileName);
    } catch (error) {
      console.error('PDF upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to start PDF analysis",
        variant: "destructive",
      });
      setCurrentStep("pdf-input");
      setCurrentOfferId(null);
    }
  };

  const pollAnalysisStatus = async (offerId: string, fileName: string) => {
    const maxAttempts = 60; // Poll for up to 60 seconds
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const { data: offerData, error } = await supabase
          .from('sponsorship_offers')
          .select('*')
          .eq('id', offerId)
          .single();

        if (error) throw error;

        attempts++;

        const analysisStatus = (offerData as any).analysis_status;

        if (analysisStatus === 'completed') {
          // Fetch associated packages with their placements
          const { data: packagesData, error: packagesError } = await supabase
            .from('sponsorship_packages')
            .select(`
              id,
              name,
              price,
              description,
              benefits,
              package_order,
              package_placements (
                placement_option_id,
                placement_options (
                  id,
                  name,
                  category,
                  description
                )
              )
            `)
            .eq('sponsorship_offer_id', offerId)
            .order('package_order');

          if (packagesError) {
            console.error('Failed to load packages:', packagesError);
          }

          // Transform packages to SponsorshipPackage format
          const transformedPackages: SponsorshipPackage[] = (packagesData || []).map(pkg => ({
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            benefits: pkg.benefits || [],
            placements: pkg.package_placements?.map((pp: any) => 
              pp.placement_options?.name || ''
            ).filter(Boolean) || [],
          }));

          // Analysis complete - transform and display
          const transformedData: SponsorshipData = {
            fundraisingGoal: offerData.fundraising_goal?.toString() || '0',
            duration: offerData.duration || 'TBD',
            description: offerData.impact || 'No description available',
            packages: transformedPackages,
            source: "pdf",
            fileName: fileName,
          };

          setSponsorshipData(transformedData);
          setCurrentStep("sponsorship-review");
          setCurrentOfferId(null);
          
          toast({
            title: "Analysis complete",
            description: `Successfully extracted ${transformedPackages.length} sponsorship packages`,
          });
        } else if (analysisStatus === 'error') {
          throw new Error('PDF analysis failed');
        } else if (attempts >= maxAttempts) {
          throw new Error('Analysis timeout - taking too long');
        } else {
          // Continue polling
          setTimeout(checkStatus, 1000);
        }
      } catch (error) {
        console.error('Poll error:', error);
        toast({
          title: "Analysis failed",
          description: error instanceof Error ? error.message : "Failed to analyze PDF",
          variant: "destructive",
        });
        setCurrentStep("pdf-input");
        setCurrentOfferId(null);
      }
    };

    // Start the polling
    checkStatus();
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
