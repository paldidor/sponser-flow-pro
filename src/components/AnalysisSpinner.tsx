import { useEffect, useState } from "react";
import { Loader2, FileText, Globe, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisSpinnerProps {
  type: "website" | "pdf";
  fileName?: string;
  profileId?: string;
  onTimeout?: () => void;
  onError?: (error: string) => void;
  timeoutMs?: number;
}

const websiteSteps = [
  { label: "Connecting to website...", duration: 2000 },
  { label: "Extracting content...", duration: 2500 },
  { label: "Analyzing data...", duration: 2000 },
  { label: "Generating packages...", duration: 1500 },
];

const pdfSteps = [
  { label: "Processing PDF...", duration: 3000 },
  { label: "Extracting text content...", duration: 4000 },
  { label: "Analyzing with AI...", duration: 5000 },
  { label: "Structuring data...", duration: 3000 },
  { label: "Finalizing results...", duration: 2000 },
];

const AnalysisSpinner = ({ 
  type, 
  fileName, 
  profileId,
  onTimeout,
  onError,
  timeoutMs = 60000, // 60 seconds default
}: AnalysisSpinnerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTimeout, setIsTimeout] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  const steps = type === "pdf" ? pdfSteps : websiteSteps;

  // Real-time status polling
  useEffect(() => {
    if (!profileId || type !== "website") return;

    const checkStatus = async () => {
      const { data } = await supabase
        .from('business_profiles')
        .select('analysis_status, analysis_error')
        .eq('id', profileId)
        .maybeSingle();

      if (data?.analysis_status === 'completed') {
        // Allow progress to reach 100%
        setProgress(100);
      } else if (data?.analysis_status === 'failed' || data?.analysis_status === 'timeout') {
        setHasError(true);
        setErrorMessage(data.analysis_error || 'Analysis failed');
        if (onError) {
          onError(data.analysis_error || 'Analysis failed');
        }
      }
    };

    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    checkStatus(); // Initial check

    return () => clearInterval(interval);
  }, [profileId, type, onError]);

  // Progress animation
  useEffect(() => {
    if (hasError || isTimeout) return;

    const totalSteps = steps.length;
    let currentStepIndex = 0;
    let accumulatedTime = 0;

    const progressInterval = setInterval(() => {
      if (currentStepIndex >= totalSteps) {
        clearInterval(progressInterval);
        return;
      }

      accumulatedTime += 100;
      const currentStepDuration = steps[currentStepIndex].duration;

      if (accumulatedTime >= currentStepDuration) {
        currentStepIndex++;
        accumulatedTime = 0;
        setCurrentStep(currentStepIndex);
      }

      const progressPercentage =
        ((currentStepIndex + accumulatedTime / currentStepDuration) /
          totalSteps) *
        100;
      setProgress(Math.min(progressPercentage, 95)); // Cap at 95% until completion
    }, 100);

    return () => clearInterval(progressInterval);
  }, [steps, hasError, isTimeout]);

  // Timeout logic
  useEffect(() => {
    if (hasError || isTimeout) return;

    // Show "taking longer" warning at 30 seconds
    const warningTimer = setTimeout(() => {
      setShowSlowWarning(true);
    }, 30000);

    // Trigger timeout at specified time
    const timeoutTimer = setTimeout(() => {
      setIsTimeout(true);
      if (onTimeout) {
        onTimeout();
      }
    }, timeoutMs);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(timeoutTimer);
    };
  }, [timeoutMs, onTimeout, hasError, isTimeout]);

  const Icon = type === "pdf" ? FileText : Globe;

  // Get appropriate status message
  const getStatusMessage = () => {
    if (hasError) return "Analysis Failed";
    if (isTimeout) return "Taking Longer Than Expected";
    if (showSlowWarning) return "Still analyzing...";
    return `Analyzing ${type === "pdf" ? "Your PDF" : "Website"}`;
  };

  const getSubMessage = () => {
    if (hasError) return errorMessage || "We couldn't complete the analysis";
    if (isTimeout) return "This is taking longer than expected. You can continue manually.";
    if (showSlowWarning) return "This may take up to 2 minutes";
    if (fileName) return fileName;
    return "Extracting sponsorship information...";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="max-w-lg w-full p-8 space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              hasError ? 'bg-destructive/10' : isTimeout ? 'bg-warning/10' : 'bg-primary/10'
            }`}>
              {hasError ? (
                <AlertCircle className="w-12 h-12 text-destructive" />
              ) : (
                <>
                  <Icon className="w-12 h-12 text-primary/40 absolute" />
                  <Loader2 className={`w-16 h-16 text-primary ${!isTimeout && !hasError ? 'animate-spin' : ''}`} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-bold">{getStatusMessage()}</h2>
          <p className={`text-lg ${hasError ? 'text-destructive' : isTimeout ? 'text-warning' : 'text-muted-foreground'}`}>
            {getSubMessage()}
          </p>
        </div>

        {!hasError && !isTimeout && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            <div className="min-h-[24px]">
              <p className="text-sm text-muted-foreground font-medium">
                {currentStep < steps.length
                  ? steps[currentStep].label
                  : "Finalizing..."}
              </p>
            </div>
          </div>
        )}

        {isTimeout && onTimeout && (
          <div className="space-y-3 pt-4">
            <Button onClick={onTimeout} className="w-full">
              Continue Manually
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              We can help you fill in your details manually
            </p>
          </div>
        )}

        {!hasError && !isTimeout && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>AI-powered analysis in progress</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnalysisSpinner;
