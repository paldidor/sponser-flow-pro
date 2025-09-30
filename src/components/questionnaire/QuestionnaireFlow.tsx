import { useState, useEffect, useCallback, lazy, Suspense, memo } from "react";
import { MultiStepOfferData, EnhancedSponsorshipPackage } from "@/types/flow";
import MultiStepContainer from "./MultiStepContainer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  getOrCreateDraftOffer,
  updateDraftStep,
  getUserTeamProfile,
  finalizeOffer,
} from "@/lib/questionnaireService";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load step components for better performance
const FundraisingGoalStep = lazy(() => import("./FundraisingGoalStep"));
const ImpactSelectionStep = lazy(() => import("./ImpactSelectionStep"));
const SupportedPlayersStep = lazy(() => import("./SupportedPlayersStep"));
const DurationSelectionStep = lazy(() => import("./DurationSelectionStep"));
const PackageBuilderStep = lazy(() => import("./PackageBuilderStep"));

interface QuestionnaireFlowProps {
  onComplete: (data: MultiStepOfferData) => void;
  onBack: () => void;
}

const TOTAL_STEPS = 5;
const AUTO_SAVE_DELAY = 2000; // Auto-save after 2 seconds of inactivity

const stepLabels = [
  "Setting your fundraising goal",
  "Defining impact areas",
  "Team information",
  "Sponsorship duration",
  "Building packages",
];

const QuestionnaireFlow = ({ onComplete, onBack }: QuestionnaireFlowProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [formData, setFormData] = useState<MultiStepOfferData>({
    currentStep: 1,
  });
  const [offerId, setOfferId] = useState<string | null>(null);
  const [teamProfileId, setTeamProfileId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  // Initialize draft and load user data
  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to continue",
            variant: "destructive",
          });
          onBack();
          return;
        }

        // Get or create draft offer
        const { offerId: draftId, data: existingData, error: draftError } = await getOrCreateDraftOffer(user.id);
        
        if (draftError) {
          toast({
            title: "Initialization failed",
            description: draftError.message,
            variant: "destructive",
          });
          
          // If network error, allow offline mode
          if (!draftError.isNetworkError) {
            onBack();
            return;
          }
        }

        if (draftId) {
          setOfferId(draftId);
        }

        // Load existing draft data if available
        if (existingData) {
          setFormData(existingData);
        }

        // Get team profile
        const { teamProfileId: profileId } = await getUserTeamProfile(user.id);
        setTeamProfileId(profileId);

      } catch (error) {
        console.error('Initialization error:', error);
        toast({
          title: "Setup failed",
          description: "Failed to initialize questionnaire",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [toast, onBack]);

  // Auto-save functionality
  const saveProgress = useCallback(async () => {
    if (!offerId || isSubmitting) return;

    setIsSaving(true);
    const result = await updateDraftStep(offerId, formData);
    
    if (result.success) {
      setLastSaved(new Date());
    } else if (result.error && !result.error.isNetworkError) {
      toast({
        title: "Save failed",
        description: result.error.message,
        variant: "destructive",
      });
    }
    
    setIsSaving(false);
  }, [offerId, formData, isSubmitting, toast]);

  // Auto-save with debounce
  useEffect(() => {
    if (isInitializing || !offerId) return;

    const timer = setTimeout(() => {
      saveProgress();
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timer);
  }, [formData, saveProgress, isInitializing, offerId]);

  const handleNext = async () => {
    // Save current step before proceeding
    if (offerId) {
      await saveProgress();
    }

    if (currentStepIndex < TOTAL_STEPS - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCanProceed(false);
    } else {
      // Final step - finalize and publish
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!offerId || !formData.packages || formData.packages.length === 0) {
      toast({
        title: "Incomplete data",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Finalize the offer in database
      const result = await finalizeOffer(offerId, teamProfileId, formData.packages);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to finalize offer');
      }

      toast({
        title: "Success!",
        description: "Your sponsorship offer has been created",
      });

      // Pass data to parent component
      onComplete(formData);

    } catch (error: any) {
      console.error('Completion error:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to create sponsorship offer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCanProceed(true); // Can always go forward from previous steps
    } else {
      onBack();
    }
  };

  // Loading fallback for lazy-loaded components
  const StepLoadingFallback = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-full" />
      </div>
      <Card className="p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    const stepContent = (() => {
      switch (currentStepIndex) {
        case 0:
          return (
            <FundraisingGoalStep
              initialValue={formData.fundraisingGoal}
              onValueChange={(value) =>
                setFormData({ ...formData, fundraisingGoal: value })
              }
              onValidityChange={setCanProceed}
            />
          );
        case 1:
          return (
            <ImpactSelectionStep
              initialValues={formData.impactTags}
              onValueChange={(values) =>
                setFormData({ ...formData, impactTags: values })
              }
              onValidityChange={setCanProceed}
            />
          );
        case 2:
          return (
            <SupportedPlayersStep
              initialValue={formData.supportedPlayers}
              onValueChange={(value) =>
                setFormData({ ...formData, supportedPlayers: value })
              }
              onValidityChange={setCanProceed}
            />
          );
        case 3:
          return (
            <DurationSelectionStep
              initialValue={formData.duration}
              onValueChange={(value) =>
                setFormData({ ...formData, duration: value })
              }
              onValidityChange={setCanProceed}
            />
          );
        case 4:
          return (
            <PackageBuilderStep
              initialPackages={formData.packages}
              onValueChange={(packages) =>
                setFormData({ ...formData, packages })
              }
              onValidityChange={setCanProceed}
            />
          );
        default:
          return null;
      }
    })();

    return (
      <Suspense fallback={<StepLoadingFallback />}>
        {stepContent}
      </Suspense>
    );
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 space-y-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Setting up your questionnaire...</p>
            <p className="text-sm text-muted-foreground">This will only take a moment</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <Card className="px-3 py-2 bg-card/95 backdrop-blur-sm border-border shadow-lg">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </>
              )}
            </p>
          </Card>
        </div>
      )}

      <MultiStepContainer
        currentStep={currentStepIndex + 1}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onBack={handleBackClick}
        canProceed={canProceed && !isSubmitting}
        showBackButton={true}
        stepLabel={stepLabels[currentStepIndex]}
      >
        {renderCurrentStep()}
      </MultiStepContainer>

      {/* Submitting overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-8 space-y-4 text-center max-w-md mx-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <p className="text-xl font-bold text-foreground">Creating your sponsorship offer...</p>
              <p className="text-sm text-muted-foreground">
                We're finalizing your packages and placements. This may take a few moments.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuestionnaireFlow;
