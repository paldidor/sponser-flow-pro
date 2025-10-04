import { useState, useEffect, useCallback } from "react";
import { MultiStepOfferData } from "@/types/flow";
import { updateDraftStep } from "@/lib/questionnaireService";
import { useToast } from "@/hooks/use-toast";

const AUTO_SAVE_DELAY = 2000; // Auto-save after 2 seconds of inactivity

interface UseAutoSaveProps {
  offerId: string | null;
  formData: MultiStepOfferData;
  isInitializing: boolean;
  isSubmitting: boolean;
}

export function useAutoSave({
  offerId,
  formData,
  isInitializing,
  isSubmitting,
}: UseAutoSaveProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

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

  return {
    isSaving,
    lastSaved,
    saveProgress,
  };
}
