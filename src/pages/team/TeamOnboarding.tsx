import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOfferCreation } from "@/hooks/useOfferCreation";
import { usePDFAnalysisPolling } from "@/hooks/usePDFAnalysisPolling";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { useProfileSubmission } from "@/hooks/useProfileSubmission";
import { getPreviousStep } from "@/lib/onboardingHelpers";
import LoadingState from "@/components/LoadingState";
import { ProfileCreationStep } from "./onboarding/ProfileCreationStep";
import { OfferCreationStep } from "./onboarding/OfferCreationStep";
import { ReviewStep } from "./onboarding/ReviewStep";
import type { MultiStepOfferData } from "@/types/flow";

const TeamOnboarding = () => {
  const [analysisFileName, setAnalysisFileName] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Custom hooks for state management
  const {
    currentStep,
    setCurrentStep,
    teamData,
    setTeamData,
    isManualEntry,
    setIsManualEntry,
    isInitializing,
    isCheckingProfile,
    verifyTeamProfile,
  } = useOnboardingState();

  const {
    handleProfileApprove: approveProfile,
    completeOnboarding,
  } = useProfileSubmission();

  const {
    currentOfferId,
    offerData,
    isLoading,
    loadingMessage,
    loadOfferData,
    loadLatestQuestionnaireOffer,
    publishOffer,
  } = useOfferCreation();

  // PDF Analysis Polling Hook
  const { startPolling: startPDFPolling } = usePDFAnalysisPolling({
    onComplete: async (offerId) => {
      await loadOfferData(offerId, 'pdf');
      setCurrentStep('review');
    },
    onFailed: () => {
      setCurrentStep('pdf-upload');
      setAnalysisFileName(null);
    },
    onTimeout: () => {
      toast({
        title: "Analysis Timeout",
        description: "The analysis is taking longer than expected. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProfileApprove = async () => {
    await approveProfile(teamData);
  };

  const handleQuestionnaireComplete = async (data: MultiStepOfferData) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Verify team profile exists
      const { data: teamProfile, error: profileError } = await supabase
        .from('team_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking team profile:', profileError);
        toast({
          title: "Profile Verification Failed",
          description: "We couldn't verify your team profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!teamProfile) {
        toast({
          title: "Profile Required First",
          description: "Please complete your team profile before creating sponsorship offers.",
          variant: "destructive",
        });
        setCurrentStep('create-profile');
        return;
      }

      toast({
        title: "Creating Packages",
        description: "Preparing your sponsorship packages...",
      });

      const offerData = await loadLatestQuestionnaireOffer();
      
      if (!offerData) {
        toast({
          title: "Offer Created",
          description: "Your offer was created but couldn't be loaded for review. Please refresh or try again.",
          variant: "destructive",
        });
        return;
      }

      // Phase 1A: Poll for packages to ensure they exist before showing review
      const offerId = offerData.packages?.[0]?.id ? 
        (await supabase.from('sponsorship_packages').select('sponsorship_offer_id').eq('id', offerData.packages[0].id).single()).data?.sponsorship_offer_id 
        : null;

      if (!offerId) {
        // Try to get offer ID from latest offer
        const { data: latestOffer } = await supabase
          .from('sponsorship_offers')
          .select('id')
          .eq('user_id', user.id)
          .eq('source', 'questionnaire')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!latestOffer?.id) {
          toast({
            title: "Error Loading Offer",
            description: "Unable to find your offer. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Poll for packages to be created
        console.log('📦 Polling for packages to be created...');
        const maxAttempts = 20; // 10 seconds total (500ms * 20)
        let attempts = 0;
        let packagesFound = false;

        while (attempts < maxAttempts && !packagesFound) {
          const { data: packages } = await supabase
            .from('sponsorship_packages')
            .select('id')
            .eq('sponsorship_offer_id', latestOffer.id);

          if (packages && packages.length > 0) {
            console.log(`✅ Found ${packages.length} package(s) after ${attempts * 500}ms`);
            packagesFound = true;
            // Reload offer data with packages
            const reloadedData = await loadOfferData(latestOffer.id, 'questionnaire');
            if (reloadedData) {
              setCurrentStep('review');
            }
            break;
          }

          attempts++;
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!packagesFound) {
          toast({
            title: "Package Loading Delayed",
            description: "Your packages are taking longer than expected. You can continue to review or wait.",
          });
          setCurrentStep('review');
        }
      } else {
        // Packages already loaded
        setCurrentStep('review');
      }
    } catch (error) {
      console.error('Unexpected error during questionnaire completion:', error);
      toast({
        title: "Error Loading Offer",
        description: "Your offer may have been created. Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  const handleReviewApprove = async () => {
    try {
      const success = await publishOffer();
      if (success) {
        await completeOnboarding();
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    const previousStep = getPreviousStep(currentStep, !!analysisFileName);
    if (previousStep) {
      setCurrentStep(previousStep);
    }
  };

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <LoadingState 
        variant="page"
        size="lg"
        message="Loading Your Profile"
        submessage="Just a moment while we check your account status..."
      />
    );
  }

  // Show loading state during profile checks
  if (isCheckingProfile) {
    return (
      <LoadingState 
        variant="page"
        size="lg"
        message="Verifying Profile"
        submessage="Making sure everything is set up correctly..."
      />
    );
  }

  const renderStep = () => {
    // Profile creation steps
    if (currentStep === 'create-profile' || currentStep === 'profile-review') {
      return (
        <ProfileCreationStep
          currentStep={currentStep}
          teamData={teamData}
          isManualEntry={isManualEntry}
          onStepChange={setCurrentStep}
          onManualEntryChange={setIsManualEntry}
          onProfileUpdate={setTeamData}
          onProfileApprove={handleProfileApprove}
        />
      );
    }

    // Offer creation steps
    if (
      currentStep === 'select-method' ||
      currentStep === 'website-analysis' ||
      currentStep === 'pdf-upload' ||
      currentStep === 'questionnaire'
    ) {
      return (
        <OfferCreationStep
          currentStep={currentStep}
          analysisFileName={analysisFileName}
          onStepChange={setCurrentStep}
          onAnalysisFileNameChange={setAnalysisFileName}
          onQuestionnaireComplete={handleQuestionnaireComplete}
          onPDFPollingStart={startPDFPolling}
          onBack={handleBack}
          verifyTeamProfile={verifyTeamProfile}
        />
      );
    }

    // Review step
    if (currentStep === 'review') {
      return (
        <ReviewStep
          offerId={currentOfferId || undefined}
          offerData={offerData}
          teamData={teamData}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          onApprove={handleReviewApprove}
          onBack={handleBack}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {renderStep()}
    </div>
  );
};

export default TeamOnboarding;
