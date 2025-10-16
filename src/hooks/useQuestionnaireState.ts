import { useState, useEffect, useCallback, useRef } from "react";
import { MultiStepOfferData } from "@/types/flow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  getOrCreateDraftOffer,
  getUserTeamProfile,
  finalizeOffer,
} from "@/lib/questionnaireService";

interface UseQuestionnaireStateProps {
  onComplete: (data: MultiStepOfferData) => void;
  onBack: () => void;
}

export function useQuestionnaireState({
  onComplete,
  onBack,
}: UseQuestionnaireStateProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [formData, setFormData] = useState<MultiStepOfferData>({
    currentStep: 1,
  });
  const [offerId, setOfferId] = useState<string | null>(null);
  const [teamProfileId, setTeamProfileId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFinalized, setHasFinalized] = useState(false);
  const initializationAttempted = useRef(false);
  const { toast } = useToast();

  // Initialize draft and load user data
  useEffect(() => {
    // Prevent re-initialization after finalization
    if (hasFinalized || initializationAttempted.current) {
      console.log('⚠️ Skipping initialization - already completed or attempted');
      return;
    }

    initializationAttempted.current = true;

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to continue",
            variant: "destructive",
          });
          onBack();
          return;
        }

        // Get or create draft offer - with skipCreation if already finalized
        const { offerId: draftId, data: existingData, error: draftError } = 
          await getOrCreateDraftOffer(user.id, hasFinalized);
        
        if (draftError) {
          // If error is ALREADY_PUBLISHED, it's okay - user already completed
          if (draftError.code === 'ALREADY_PUBLISHED') {
            console.log('✅ Offer already published, no action needed');
            setIsInitializing(false);
            return;
          }

          // If error is CREATION_DISABLED, it's okay - finalization in progress
          if (draftError.code === 'CREATION_DISABLED') {
            console.log('✅ Draft creation disabled after finalization');
            setIsInitializing(false);
            return;
          }

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
  }, [hasFinalized, toast, onBack]);

  const handleComplete = useCallback(async () => {
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

      // Mark as finalized to prevent re-initialization
      setHasFinalized(true);
      console.log('✅ Offer finalized, draft creation now disabled');

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
  }, [offerId, teamProfileId, formData, onComplete, toast]);

  return {
    currentStepIndex,
    setCurrentStepIndex,
    canProceed,
    setCanProceed,
    formData,
    setFormData,
    offerId,
    teamProfileId,
    isInitializing,
    isSubmitting,
    handleComplete,
  };
}
