import { useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOfferCreation } from "@/hooks/useOfferCreation";
import { usePDFAnalysisPolling } from "@/hooks/usePDFAnalysisPolling";
import { validatePDFFile } from "@/lib/validationUtils";
import LoadingState from "@/components/LoadingState";

const CreateSponsorshipOffer = lazy(() => import("@/components/CreateSponsorshipOffer"));
const QuestionnaireFlow = lazy(() => import("@/components/questionnaire/QuestionnaireFlow"));
const PDFAnalysisProgress = lazy(() => import("@/components/PDFAnalysisProgress"));
const WebsiteAnalysisInput = lazy(() => import("@/components/WebsiteAnalysisInput"));
const AnalysisSpinner = lazy(() => import("@/components/AnalysisSpinner"));
const SponsorshipReview = lazy(() => import("@/components/SponsorshipReview"));

type FlowStep = 'select-method' | 'questionnaire' | 'pdf-analysis' | 'review' | 'website-input' | 'website-analysis';

interface CreateOfferFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

const CreateOfferFlow = ({ onComplete, onCancel }: CreateOfferFlowProps) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('select-method');
  const [analysisFileName, setAnalysisFileName] = useState<string | null>(null);
  const [failedOfferId, setFailedOfferId] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentOfferId, offerData, isLoading: isLoadingOffer, loadingMessage, loadOfferData, loadLatestQuestionnaireOffer, publishOffer, resetOffer } = useOfferCreation();

  // PDF Analysis Polling Hook
  const { startPolling: startPDFPolling } = usePDFAnalysisPolling({
    maxAttempts: 60,
    onComplete: async (offerId) => {
      await loadOfferData(offerId, 'pdf');
      
      // Wait for packages to be created (poll for up to 10 seconds)
      let packageCheckAttempts = 0;
      const maxPackageAttempts = 20; // 20 attempts * 500ms = 10 seconds
      
      while (packageCheckAttempts < maxPackageAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: packages } = await supabase
          .from('sponsorship_packages')
          .select('id')
          .eq('sponsorship_offer_id', offerId);
        
        if (packages && packages.length > 0) {
          console.log(`✅ Found ${packages.length} packages after ${packageCheckAttempts + 1} attempts`);
          break;
        }
        
        packageCheckAttempts++;
      }
      
      if (packageCheckAttempts >= maxPackageAttempts) {
        toast({
          title: "Package Loading Delayed",
          description: "Packages are still being created. They will appear shortly.",
        });
      }
      
      setCurrentStep('review');
    },
    onFailed: (offerId, errorMessage) => {
      setFailedOfferId(offerId);
      toast({
        title: "PDF Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      setTimeout(() => {
        setCurrentStep('questionnaire');
        setAnalysisFileName(null);
        resetOffer();
      }, 3000);
    },
    onTimeout: (offerId) => {
      setFailedOfferId(offerId);
      toast({
        title: "Analysis Timeout",
        description: "The analysis is taking longer than expected. Let's try the questionnaire instead - it only takes 2-3 minutes!",
        variant: "destructive",
      });
      
      setTimeout(() => {
        setCurrentStep('questionnaire');
        setAnalysisFileName(null);
        resetOffer();
      }, 3000);
    },
  });

  const handleSelectMethod = (method: "form" | "website" | "pdf", url?: string) => {
    if (method === "form") {
      setCurrentStep('questionnaire');
    } else if (method === "website") {
      setCurrentStep('website-input');
    }
    // PDF method is now handled directly in CreateSponsorshipOffer
  };

  const handleDirectPDFUpload = async (fileUrl: string, fileName: string, file: File) => {
    await handlePDFUpload(fileUrl, fileName, file);
  };

  const handlePDFUpload = async (fileUrl: string, fileName: string, file?: File) => {
    // Validate file if provided
    if (file) {
      const fileValidation = validatePDFFile(file);
      if (!fileValidation.isValid) {
        toast({
          title: "Invalid File",
          description: fileValidation.error,
          variant: "destructive",
        });
        return;
      }
    }

    setAnalysisFileName(fileName);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create an offer.",
        variant: "destructive",
      });
      return;
    }

    // Fetch user's team profile with deterministic query
    const { data: teamProfile, error: profileError } = await supabase
      .from('team_profiles')
      .select('id, team_name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching team profile:', profileError);
      toast({
        title: "Failed to Load Profile",
        description: "Could not retrieve your team profile. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!teamProfile?.id) {
      console.error('No team profile found for user:', user.id);
      toast({
        title: "Profile Required",
        description: "Please complete your team profile first before creating offers.",
        variant: "destructive",
      });
      onCancel();
      return;
    }

    const teamProfileId = teamProfile.id;
    
    const payload = {
      user_id: user.id,
      team_profile_id: teamProfileId,
      title: teamProfile.team_name || `Sponsorship from ${fileName}`,
      fundraising_goal: 0,
      duration: 'TBD',
      impact: 'Analysis in progress...',
      pdf_public_url: fileUrl,
      source_file_name: fileName,
      analysis_status: 'pending',
      source: 'pdf',
      status: 'draft'
    };
    
    console.debug('[CreateOfferFlow] Inserting offer with payload:', { ...payload, team_profile_id: teamProfileId });

    const { data: offerData, error: createError } = await supabase
      .from('sponsorship_offers')
      .insert(payload)
      .select()
      .single();

    if (createError || !offerData) {
      console.error('[CreateOfferFlow] Error creating offer:', {
        message: createError?.message,
        details: createError?.details,
        hint: createError?.hint,
        code: createError?.code
      });
      toast({
        title: "Error Creating Offer",
        description: createError?.message || "Failed to create sponsorship offer. Please try again.",
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
    
    startPDFPolling(offerData.id);
  };

  const loadPDFOfferData = async (offerId: string) => {
    const data = await loadOfferData(offerId, 'pdf');
    if (data) {
      setCurrentStep('review');
    }
  };

  const handleRetryAnalysis = async (retryOfferId: string) => {
    // Fetch the existing offer
    const { data: existingOffer, error: fetchError } = await supabase
      .from('sponsorship_offers')
      .select('pdf_public_url, source_file_name')
      .eq('id', retryOfferId)
      .maybeSingle();

    if (fetchError || !existingOffer || !existingOffer.pdf_public_url) {
      toast({
        title: "Retry Failed",
        description: "Could not find the original PDF. Please upload it again.",
        variant: "destructive",
      });
      return;
    }

    // Reset analysis status
    const { error: resetError } = await supabase
      .from('sponsorship_offers')
      .update({ 
        analysis_status: 'pending',
        impact: 'Analysis in progress...'
      })
      .eq('id', retryOfferId);

    if (resetError) {
      toast({
        title: "Retry Failed",
        description: "Failed to reset analysis. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Get user data
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to retry analysis.",
        variant: "destructive",
      });
      return;
    }

    // Get team profile with deterministic query
    const { data: teamProfile, error: profileError } = await supabase
      .from('team_profiles')
      .select('id, team_name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching team profile for retry:', profileError);
      toast({
        title: "Profile Fetch Failed",
        description: "Could not retrieve your team profile. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!teamProfile?.id) {
      console.error('No team profile found for user during retry:', user.id);
      toast({
        title: "Profile Required",
        description: "Please complete your team profile first.",
        variant: "destructive",
      });
      onCancel();
      return;
    }

    // Re-invoke the edge function
    setAnalysisFileName(existingOffer.source_file_name || 'Sponsorship PDF');
    setCurrentStep('pdf-analysis');
    
    const { error: invokeError } = await supabase.functions.invoke('analyze-pdf-sponsorship', {
      body: { 
        pdfUrl: existingOffer.pdf_public_url, 
        offerId: retryOfferId, 
        userId: user.id,
        teamProfileId: teamProfile.id
      }
    });

    if (invokeError) {
      toast({
        title: "Analysis Error",
        description: "Failed to restart PDF analysis. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Reset failed state and start polling
    setFailedOfferId(null);
    startPDFPolling(retryOfferId);
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
      // Get the offer ID from the loaded data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: offer } = await supabase
          .from('sponsorship_offers')
          .select('id')
          .eq('user_id', user.id)
          .eq('source', 'questionnaire')
          .eq('status', 'published')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (offer) {
          // Wait for packages to be created (poll for up to 10 seconds)
          toast({
            title: "Preparing Packages",
            description: "Loading your sponsorship packages...",
          });
          
          let packageCheckAttempts = 0;
          const maxPackageAttempts = 20; // 20 attempts * 500ms = 10 seconds
          
          while (packageCheckAttempts < maxPackageAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { data: packages } = await supabase
              .from('sponsorship_packages')
              .select('id')
              .eq('sponsorship_offer_id', offer.id);
            
            if (packages && packages.length > 0) {
              console.log(`✅ Found ${packages.length} packages after ${packageCheckAttempts + 1} attempts`);
              break;
            }
            
            packageCheckAttempts++;
          }
          
          if (packageCheckAttempts >= maxPackageAttempts) {
            toast({
              title: "Package Loading Delayed",
              description: "Packages are still being created. They will appear shortly.",
            });
          }
        }
      }
      
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
    if (currentStep === 'questionnaire' || currentStep === 'website-input') {
      setCurrentStep('select-method');
      resetOffer();
    } else if (currentStep === 'pdf-analysis') {
      setCurrentStep('select-method');
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
    <LoadingState size="md" message="Loading component..." />
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'select-method':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CreateSponsorshipOffer 
              onSelectMethod={handleSelectMethod}
              onPDFUpload={handleDirectPDFUpload}
              onCancel={onCancel}
            />
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

      case 'pdf-analysis':
        return (
          <Suspense fallback={<LoadingFallback />}>
            {analysisFileName && (
              <PDFAnalysisProgress
                fileName={analysisFileName}
                onCancel={onCancel}
                offerId={failedOfferId}
                onRetry={failedOfferId ? () => handleRetryAnalysis(failedOfferId) : undefined}
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
        if (!offerData || isLoadingOffer) {
          return (
            <LoadingState 
              variant="page"
              size="lg"
              message={loadingMessage || "Loading Offer Details"}
              submessage="Preparing your sponsorship offer for review..."
            />
          );
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
