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
import QuestionnaireFlow from "./components/questionnaire/QuestionnaireFlow";
import WebsiteAnalysisInput from "./components/WebsiteAnalysisInput";
import AnalysisSpinner from "./components/AnalysisSpinner";
import PDFUploadInput from "./components/PDFUploadInput";
import PDFAnalysisProgress from "./components/PDFAnalysisProgress";
import SponsorshipReview from "./components/SponsorshipReview";
import SponsorshipMarketplace from "./components/SponsorshipMarketplace";
import { FlowStep, TeamProfile, SponsorshipData, SponsorshipPackage, MultiStepOfferData } from "./types/flow";

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
      setCurrentStep("fundraising-goal");
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

      console.log('Creating sponsorship offer record...');
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

      if (offerError) {
        console.error('Failed to create offer:', offerError);
        throw offerError;
      }

      console.log('Offer created, starting analysis:', offerData.id);
      setCurrentOfferId(offerData.id);

      // Call edge function asynchronously (will run in background)
      const { error: invokeError } = await supabase.functions.invoke('analyze-pdf-sponsorship', {
        body: {
          pdfUrl: fileUrl,
          offerId: offerData.id,
          userId: user.id
        }
      });

      if (invokeError) {
        console.error('Failed to invoke edge function:', invokeError);
        throw new Error('Failed to start analysis: ' + invokeError.message);
      }

      console.log('Analysis started, beginning polling...');

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

  const handleCancelAnalysis = () => {
    if (currentOfferId) {
      // Mark as cancelled in database
      supabase
        .from('sponsorship_offers')
        .update({ analysis_status: 'error', impact: 'Analysis cancelled by user' })
        .eq('id', currentOfferId)
        .then(() => {
          setCurrentOfferId(null);
          setCurrentStep("pdf-input");
          toast({
            title: "Analysis cancelled",
            description: "You can upload a different PDF to try again",
          });
        });
    } else {
      setCurrentStep("pdf-input");
    }
  };

  const pollAnalysisStatus = async (offerId: string, fileName: string) => {
    const maxAttempts = 90; // Poll for up to 90 seconds (increased for large PDFs)
    let attempts = 0;
    const pollInterval = 1500; // Check every 1.5 seconds

    const checkStatus = async () => {
      try {
        const { data: offerData, error } = await supabase
          .from('sponsorship_offers')
          .select('*')
          .eq('id', offerId)
          .single();

        if (error) {
          console.error('Failed to fetch offer status:', error);
          throw error;
        }

        attempts++;
        console.log(`Polling attempt ${attempts}/${maxAttempts}, status: ${(offerData as any).analysis_status}`);

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
            description: `Successfully extracted ${transformedPackages.length} sponsorship package${transformedPackages.length !== 1 ? 's' : ''}`,
          });
        } else if (analysisStatus === 'error') {
          const errorMessage = offerData.impact?.includes('Analysis failed') 
            ? offerData.impact.replace('Analysis failed: ', '')
            : 'PDF analysis failed';
          throw new Error(errorMessage);
        } else if (attempts >= maxAttempts) {
          throw new Error('Analysis is taking longer than expected. The PDF may be too complex. Please try a simpler document or contact support.');
        } else {
          // Continue polling
          setTimeout(checkStatus, pollInterval);
        }
      } catch (error) {
        console.error('Poll error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze PDF';
        
        toast({
          title: "Analysis failed",
          description: errorMessage,
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

  const handleQuestionnaireComplete = (data: MultiStepOfferData) => {
    // Transform MultiStepOfferData to SponsorshipData format
    const transformedData: SponsorshipData = {
      fundraisingGoal: data.fundraisingGoal || "0",
      duration: data.duration || "",
      description: data.impactTags?.join(", ") || "",
      packages: (data.packages || []).map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        benefits: [],
        placements: pkg.placementIds,
      })),
      source: "form",
    };
    setSponsorshipData(transformedData);
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
      case "fundraising-goal":
      case "website-input":
      case "pdf-input":
        setCurrentStep("create-offer");
        break;
      case "sponsorship-review":
        if (sponsorshipData?.source === "form") {
          setCurrentStep("fundraising-goal");
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
      case "fundraising-goal":
      case "impact-selection":
      case "supported-players":
      case "duration-selection":
      case "package-builder":
        return <QuestionnaireFlow onComplete={handleQuestionnaireComplete} onBack={handleBack} />;
      case "website-input":
        return <WebsiteAnalysisInput onAnalyze={handleWebsiteAnalyze} onBack={handleBack} />;
      case "website-analysis":
        return <AnalysisSpinner type="website" />;
      case "pdf-input":
        return <PDFUploadInput onUpload={handlePDFUpload} onBack={handleBack} />;
      case "pdf-analysis":
        return <PDFAnalysisProgress fileName={analysisFileName} onCancel={handleCancelAnalysis} />;
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
