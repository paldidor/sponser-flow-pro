import { useState, useEffect, useCallback } from "react";
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
