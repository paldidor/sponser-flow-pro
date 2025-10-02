import { useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOfferCreation } from "@/hooks/useOfferCreation";
import { Loader2 } from "lucide-react";

const CreateSponsorshipOffer = lazy(() => import("@/components/CreateSponsorshipOffer"));
const QuestionnaireFlow = lazy(() => import("@/components/questionnaire/QuestionnaireFlow"));
const PDFUploadInput = lazy(() => import("@/components/PDFUploadInput"));
const PDFAnalysisProgress = lazy(() => import("@/components/PDFAnalysisProgress"));
const WebsiteAnalysisInput = lazy(() => import("@/components/WebsiteAnalysisInput"));
const AnalysisSpinner = lazy(() => import("@/components/AnalysisSpinner"));
const SponsorshipReview = lazy(() => import("@/components/SponsorshipReview"));

type FlowStep = 'select-method' | 'questionnaire' | 'pdf-upload' | 'pdf-analysis' | 'review' | 'website-input' | 'website-analysis';

interface CreateOfferFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

const CreateOfferFlow = ({ onComplete, onCancel }: CreateOfferFlowProps) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('select-method');
  const [analysisFileName, setAnalysisFileName] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentOfferId, offerData, loadOfferData, loadLatestQuestionnaireOffer, publishOffer, resetOffer } = useOfferCreation();

  const handleSelectMethod = (method: "form" | "website" | "pdf", url?: string) => {
    if (method === "form") {
      setCurrentStep('questionnaire');
    } else if (method === "website") {
      setCurrentStep('website-input');
    } else {
      setCurrentStep('pdf-upload');
    }
  };

  const handlePDFUpload = async (fileUrl: string, fileName: string) => {
    setAnalysisFileName(fileName);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create an offer.",
        variant: "destructive",
      });
      return;
    }

    // Fetch user's team profile
    const { data: teamProfile, error: profileError } = await supabase
      .from('team_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching team profile:', profileError);
      toast({
        title: "Error",
        description: "Failed to load team profile. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const teamProfileId = teamProfile?.id || null;

    const { data: offerData, error: createError } = await supabase
      .from('sponsorship_offers')
      .insert({
        user_id: user.id,
        team_profile_id: teamProfileId,
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

    if (createError || !offerData) {
      console.error('Error creating offer:', createError);
      toast({
        title: "Error",
        description: "Failed to create sponsorship offer. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('pdf-analysis');
    
    const { error: invokeError } = await supabase.functions.invoke('analyze-pdf-sponsorship', {
      body: { pdfUrl: fileUrl, offerId: offerData.id, userId: user.id, teamProfileId }
    });

    if (invokeError) {
      console.error('Error invoking analysis function:', invokeError);
      toast({
        title: "Analysis Error",
        description: "Failed to start PDF analysis. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    pollAnalysisStatus(offerData.id);
  };

  const loadPDFOfferData = async (offerId: string) => {
    const data = await loadOfferData(offerId, 'pdf');
    if (data) {
      setCurrentStep('review');
    }
  };

  const pollAnalysisStatus = async (offerId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const checkStatus = async (): Promise<'completed' | 'failed' | 'pending'> => {
      const { data, error } = await supabase
        .from('sponsorship_offers')
        .select('analysis_status')
        .eq('id', offerId)
        .maybeSingle();

      if (error) {
        console.error('Error checking analysis status:', error);
        return 'pending';
      }

      if (!data) {
        console.error('Offer not found');
        return 'failed';
      }

      if (data.analysis_status === 'completed') {
        return 'completed';
      } else if (data.analysis_status === 'failed' || data.analysis_status === 'error') {
        return 'failed';
      }

      return 'pending';
    };

    while (attempts < maxAttempts) {
      const status = await checkStatus();
      
      if (status === 'completed') {
        await loadPDFOfferData(offerId);
        return;
      } else if (status === 'failed') {
        toast({
          title: "Analysis Failed",
          description: "Please try again or choose a different method.",
          variant: "destructive",
        });
        setCurrentStep('pdf-upload');
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    toast({
      title: "Analysis Timeout",
      description: "The analysis is taking longer than expected. Please check your dashboard or try again.",
      variant: "destructive",
    });
    onComplete(); // Still navigate to dashboard even on timeout
  };

  const handleWebsiteAnalyze = async (url: string) => {
    setCurrentStep('website-analysis');
    
    // Simulate website analysis (you can replace this with actual API call)
    setTimeout(() => {
      toast({
        title: "Analysis Complete",
        description: "Your sponsorship packages have been created!",
      });
      onComplete();
    }, 5000);
  };

  const handleQuestionnaireComplete = async () => {
    toast({
      title: "Loading Your Offer",
      description: "Preparing your sponsorship offer for review...",
    });

    const data = await loadLatestQuestionnaireOffer();
    
    if (data) {
      setCurrentStep('review');
    } else {
      // If we can't load for review, just go to completion
      toast({
        title: "Offer Created Successfully",
        description: "Your sponsorship offer has been created!",
      });
      setTimeout(() => onComplete(), 1500);
    }
  };

  const handleReviewApprove = async () => {
    const success = await publishOffer();
    if (success) {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === 'questionnaire' || currentStep === 'pdf-upload' || currentStep === 'website-input') {
      setCurrentStep('select-method');
      resetOffer();
    } else if (currentStep === 'pdf-analysis') {
      setCurrentStep('pdf-upload');
      setAnalysisFileName(null);
      resetOffer();
    } else if (currentStep === 'review') {
      setCurrentStep('select-method');
      resetOffer();
    } else if (currentStep === 'website-analysis') {
      setCurrentStep('website-input');
    }
  };

  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'select-method':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CreateSponsorshipOffer onSelectMethod={handleSelectMethod} />
          </Suspense>
        );

      case 'questionnaire':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <QuestionnaireFlow
              onComplete={handleQuestionnaireComplete}
              onBack={handleBack}
            />
          </Suspense>
        );

      case 'pdf-upload':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PDFUploadInput
              onUpload={handlePDFUpload}
              onBack={handleBack}
            />
          </Suspense>
        );

      case 'pdf-analysis':
        return (
          <Suspense fallback={<LoadingFallback />}>
            {analysisFileName && (
              <PDFAnalysisProgress
                fileName={analysisFileName}
                onCancel={onCancel}
              />
            )}
          </Suspense>
        );

      case 'website-input':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <WebsiteAnalysisInput
              onAnalyze={handleWebsiteAnalyze}
              onBack={handleBack}
            />
          </Suspense>
        );

      case 'review':
        if (!offerData) {
          return <LoadingFallback />;
        }
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SponsorshipReview
              sponsorshipData={offerData}
              teamData={null}
              onApprove={handleReviewApprove}
              onBack={handleBack}
            />
          </Suspense>
        );

      case 'website-analysis':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AnalysisSpinner type="website" />
          </Suspense>
        );

      default:
        return null;
    }
  };

  return renderStep();
};

export default CreateOfferFlow;
