import { useEffect, useState } from "react";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PDFAnalysisProgressProps {
  fileName: string;
  onCancel?: () => void;
  onError?: () => void;
  offerId?: string | null;
  onRetry?: () => void;
}

const PDFAnalysisProgress = ({ fileName, onCancel, offerId, onRetry }: PDFAnalysisProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(25);
  const [currentStage, setCurrentStage] = useState<string>("Downloading your PDF...");

  const getProgressStage = (elapsedSeconds: number): string => {
    if (elapsedSeconds < 10) return "Downloading your PDF...";
    if (elapsedSeconds < 25) return "Extracting text and data...";
    if (elapsedSeconds < 45) return "AI analyzing sponsorship details...";
    if (elapsedSeconds < 60) return "Saving packages to your offer...";
    return "Almost done, finalizing...";
  };

  useEffect(() => {
    let elapsed = 0;
    const totalDuration = 25000; // 25 seconds for visual progress

    const interval = setInterval(() => {
      elapsed += 100;
      const elapsedSeconds = Math.floor(elapsed / 1000);
      
      // Calculate progress (stop at 95% until actual completion)
      const newProgress = Math.min((elapsed / totalDuration) * 100, 95);
      setProgress(newProgress);

      // Update current stage based on elapsed time
      setCurrentStage(getProgressStage(elapsedSeconds));

      // Calculate estimated time remaining
      const remainingTime = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));
      setEstimatedTimeRemaining(remainingTime);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="max-w-2xl w-full p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-12 h-12 text-primary/40 absolute" />
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-bold">Analyzing Your PDF</h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span className="text-sm">{fileName}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          
          {/* Estimated Time */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Estimated time remaining:</span>
            <span className="font-semibold text-foreground">
              {estimatedTimeRemaining > 0 ? `${estimatedTimeRemaining}s` : 'Almost done...'}
            </span>
          </div>
        </div>

        {/* Dynamic Stage Message */}
        <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <p className="text-sm font-medium">{currentStage}</p>
        </div>

        {/* Info & Actions */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>AI-powered analysis • Secure processing</span>
          </div>
          
          <div className="flex justify-center gap-2">
            {onRetry && offerId && (
              <Button variant="default" size="sm" onClick={onRetry}>
                Retry Analysis
              </Button>
            )}
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel Analysis
              </Button>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Processing Tips
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Large PDFs may take longer. We analyze up to 50 pages for optimal results.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PDFAnalysisProgress;
