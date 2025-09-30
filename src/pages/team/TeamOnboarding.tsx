import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreateTeamProfile from "@/components/CreateTeamProfile";
import ProfileReview from "@/components/ProfileReview";
import CreateSponsorshipOffer from "@/components/CreateSponsorshipOffer";
import QuestionnaireFlow from "@/components/questionnaire/QuestionnaireFlow";
import SponsorshipForm from "@/components/SponsorshipForm";
import SponsorshipReview from "@/components/SponsorshipReview";
import WebsiteAnalysisInput from "@/components/WebsiteAnalysisInput";
import PDFUploadInput from "@/components/PDFUploadInput";
import PDFAnalysisProgress from "@/components/PDFAnalysisProgress";
import type { TeamProfile, SponsorshipData, SponsorshipPackage } from "@/types/flow";

type OnboardingStep =
  | 'create-profile'
  | 'profile-review'
  | 'select-method'
  | 'website-analysis'
  | 'pdf-upload'
  | 'fill-form'
  | 'questionnaire'
  | 'review';

const TeamOnboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('create-profile');
  const [teamData, setTeamData] = useState<TeamProfile | null>(null);
  const [sponsorshipData, setSponsorshipData] = useState<SponsorshipData | null>(null);
  const [analysisFileName, setAnalysisFileName] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user already has a profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('team_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentStep('select-method');
      }
    };

    checkExistingProfile();
  }, []);

  // ... keep existing code (handler functions)
  const handleProfileApprove = () => {
    setCurrentStep('select-method');
  };

  const handleSelectMethod = (method: "form" | "website" | "pdf", url?: string) => {
    if (method === "form") {
      setCurrentStep('questionnaire');
    } else if (method === "website") {
      setCurrentStep('website-analysis');
    } else {
      setCurrentStep('pdf-upload');
    }
  };

  const handleWebsiteAnalyze = (url: string) => {
    setCurrentStep('website-analysis');
  };

  const handlePDFUpload = () => {
    setCurrentStep('pdf-upload');
  };

  const handleCancelAnalysis = () => {
    setCurrentStep('select-method');
    setAnalysisFileName(null);
  };

  const pollAnalysisStatus = async (offerId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const checkStatus = async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from('sponsorship_offers')
        .select('analysis_status')
        .eq('id', offerId)
        .single();

      if (error) {
        console.error('Error checking analysis status:', error);
        return false;
      }

      if (data.analysis_status === 'completed') {
        return true;
      } else if (data.analysis_status === 'failed') {
        toast({
          title: "Analysis Failed",
          description: "Please try again or choose a different method.",
          variant: "destructive",
        });
        return false;
      }

      return false;
    };

    while (attempts < maxAttempts) {
      const isComplete = await checkStatus();
      if (isComplete) {
        setCurrentStep('questionnaire');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    toast({
      title: "Analysis Timeout",
      description: "The analysis is taking longer than expected. Please try again.",
      variant: "destructive",
    });
  };

  const handleFormComplete = (data: SponsorshipData) => {
    setSponsorshipData(data);
    setCurrentStep('questionnaire');
  };

  const handleQuestionnaireComplete = async () => {
    setCurrentStep('review');
  };

  const handleReviewApprove = async () => {
    try {
      if (currentOfferId) {
        const { error } = await supabase
          .from('sponsorship_offers')
          .update({ status: 'published' })
          .eq('id', currentOfferId);

        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: "Your sponsorship offer has been published.",
      });

      navigate('/marketplace');
    } catch (error) {
      console.error('Error publishing offer:', error);
      toast({
        title: "Error",
        description: "Failed to publish offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    const stepOrder: OnboardingStep[] = ['create-profile', 'profile-review', 'select-method', 'questionnaire', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'create-profile':
        return (
          <CreateTeamProfile
            onAnalyzeWebsite={(url) => {
              setCurrentStep('profile-review');
            }}
            onFillManually={() => {
              setIsManualEntry(true);
              setCurrentStep('profile-review');
            }}
          />
        );

      case 'profile-review':
        return (
          <ProfileReview
            teamData={teamData}
            onApprove={handleProfileApprove}
            isManualEntry={isManualEntry}
          />
        );

      case 'select-method':
        return (
          <CreateSponsorshipOffer
            onSelectMethod={handleSelectMethod}
          />
        );

      case 'website-analysis':
        return (
          <WebsiteAnalysisInput
            onAnalyze={async (url) => {
              toast({
                title: "Analysis Started",
                description: "We're analyzing your website...",
              });
              setCurrentStep('questionnaire');
            }}
            onBack={handleCancelAnalysis}
          />
        );

      case 'pdf-upload':
        return analysisFileName ? (
          <PDFAnalysisProgress
            fileName={analysisFileName}
            onCancel={handleCancelAnalysis}
          />
        ) : (
          <PDFUploadInput
            onUpload={async (fileUrl, fileName) => {
              setAnalysisFileName(fileName);
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const { data: offerData } = await supabase
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

              if (offerData) {
                setCurrentOfferId(offerData.id);
                await supabase.functions.invoke('analyze-pdf-sponsorship', {
                  body: { pdfUrl: fileUrl, offerId: offerData.id, userId: user.id }
                });
                pollAnalysisStatus(offerData.id);
              }
            }}
            onBack={handleCancelAnalysis}
          />
        );

      case 'fill-form':
        return (
          <SponsorshipForm
            onComplete={handleFormComplete}
            onBack={() => setCurrentStep('select-method')}
          />
        );

      case 'questionnaire':
        return (
          <QuestionnaireFlow
            onComplete={handleQuestionnaireComplete}
            onBack={handleBack}
          />
        );

      case 'review':
        return (
          <SponsorshipReview
            sponsorshipData={sponsorshipData!}
            teamData={teamData}
            onApprove={handleReviewApprove}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {renderStep()}
    </div>
  );
};

export default TeamOnboarding;
