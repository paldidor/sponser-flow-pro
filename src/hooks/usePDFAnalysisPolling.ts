import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AnalysisStatus = 'completed' | 'failed' | 'pending';

interface UsePDFAnalysisPollingOptions {
  maxAttempts?: number;
  initialWaitTime?: number;
  extendedWaitTime?: number;
  extendedWaitThreshold?: number;
  onComplete?: (offerId: string) => Promise<void> | void;
  onFailed?: (offerId: string, errorMessage: string) => void;
  onTimeout?: (offerId: string) => void;
}

interface UsePDFAnalysisPollingReturn {
  isPolling: boolean;
  currentOfferId: string | null;
  startPolling: (offerId: string) => Promise<void>;
  stopPolling: () => void;
}

export const usePDFAnalysisPolling = (
  options: UsePDFAnalysisPollingOptions = {}
): UsePDFAnalysisPollingReturn => {
  const {
    maxAttempts = 60,
    initialWaitTime = 2000,
    extendedWaitTime = 3000,
    extendedWaitThreshold = 30,
    onComplete,
    onFailed,
    onTimeout,
  } = options;

  const { toast } = useToast();
  const [isPolling, setIsPolling] = useState(false);
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);
  const [shouldStop, setShouldStop] = useState(false);

  const checkStatus = async (offerId: string): Promise<AnalysisStatus> => {
    const { data, error } = await supabase
      .from('sponsorship_offers')
      .select('analysis_status, impact')
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

  const getErrorMessage = async (offerId: string): Promise<string> => {
    const { data: offerData } = await supabase
      .from('sponsorship_offers')
      .select('impact')
      .eq('id', offerId)
      .maybeSingle();
    
    return offerData?.impact || "We couldn't process your PDF. Let's try the questionnaire instead - it only takes 2-3 minutes!";
  };

  const startPolling = async (offerId: string) => {
    setIsPolling(true);
    setCurrentOfferId(offerId);
    setShouldStop(false);
    let attempts = 0;

    while (attempts < maxAttempts && !shouldStop) {
      const status = await checkStatus(offerId);
      
      if (status === 'completed') {
        if (onComplete) {
          await onComplete(offerId);
        }
        setIsPolling(false);
        setCurrentOfferId(null);
        return;
      } else if (status === 'failed') {
        const errorMessage = await getErrorMessage(offerId);
        
        if (onFailed) {
          onFailed(offerId, errorMessage);
        } else {
          toast({
            title: "PDF Analysis Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
        
        setIsPolling(false);
        setCurrentOfferId(null);
        return;
      }
      
      // Exponential backoff
      const waitTime = attempts < extendedWaitThreshold ? initialWaitTime : extendedWaitTime;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      attempts++;
    }

    // Timeout handling
    if (!shouldStop) {
      if (onTimeout) {
        onTimeout(offerId);
      } else {
        toast({
          title: "Analysis Timeout",
          description: "The analysis is taking longer than expected. Let's try the questionnaire instead - it only takes 2-3 minutes!",
          variant: "destructive",
        });
      }
    }
    
    setIsPolling(false);
    setCurrentOfferId(null);
  };

  const stopPolling = () => {
    setShouldStop(true);
    setIsPolling(false);
    setCurrentOfferId(null);
  };

  return {
    isPolling,
    currentOfferId,
    startPolling,
    stopPolling,
  };
};
