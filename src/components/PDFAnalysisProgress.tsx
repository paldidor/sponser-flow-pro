import { useEffect, useState } from "react";
import { Loader2, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PDFAnalysisProgressProps {
  fileName: string;
  onCancel?: () => void;
}

const analysisSteps = [
  { label: "Uploading PDF to secure storage...", duration: 2000, icon: FileText },
  { label: "Downloading and validating file...", duration: 3000, icon: FileText },
  { label: "Extracting text from pages...", duration: 5000, icon: FileText },
  { label: "Analyzing with AI...", duration: 8000, icon: Loader2 },
  { label: "Structuring sponsorship data...", duration: 4000, icon: CheckCircle2 },
  { label: "Creating packages and placements...", duration: 3000, icon: CheckCircle2 },
];

const PDFAnalysisProgress = ({ fileName, onCancel }: PDFAnalysisProgressProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(25);

  useEffect(() => {
    let elapsed = 0;
    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);

    const interval = setInterval(() => {
      elapsed += 100;
      
      // Calculate progress
      const newProgress = Math.min((elapsed / totalDuration) * 100, 95);
      setProgress(newProgress);

      // Update current step
      let cumulativeDuration = 0;
      for (let i = 0; i < analysisSteps.length; i++) {
        cumulativeDuration += analysisSteps[i].duration;
        if (elapsed < cumulativeDuration) {
          setCurrentStep(i);
          break;
        }
      }

      // Calculate estimated time remaining
      const remainingTime = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));
      setEstimatedTimeRemaining(remainingTime);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = analysisSteps[currentStep]?.icon || Loader2;

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

        {/* Current Step */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <CurrentIcon className="w-5 h-5 text-primary animate-pulse" />
            <p className="text-sm font-medium">
              {analysisSteps[currentStep]?.label || 'Finalizing...'}
            </p>
          </div>

          {/* All Steps */}
          <div className="space-y-2">
            {analysisSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded transition-all ${
                    isCurrent ? 'bg-primary/5' : ''
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : isCurrent ? (
                    <StepIcon className="w-4 h-4 text-primary flex-shrink-0 animate-pulse" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      isCompleted
                        ? 'text-muted-foreground line-through'
                        : isCurrent
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info & Cancel */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>AI-powered analysis • Secure processing</span>
          </div>
          
          {onCancel && (
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel Analysis
              </Button>
            </div>
          )}
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
