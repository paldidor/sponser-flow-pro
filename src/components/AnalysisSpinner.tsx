import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface AnalysisSpinnerProps {
  type: "website" | "pdf";
  fileName?: string;
}

const steps = [
  { label: "Connecting to website", duration: 2000 },
  { label: "Analyzing content", duration: 3000 },
  { label: "Extracting team information", duration: 3000 },
  { label: "Processing social media data", duration: 2000 },
  { label: "Finalizing profile", duration: 2000 },
];

const AnalysisSpinner = ({ type, fileName }: AnalysisSpinnerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 100;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 95);
      setProgress(newProgress);

      let cumulativeDuration = 0;
      for (let i = 0; i < steps.length; i++) {
        cumulativeDuration += steps[i].duration;
        if (elapsed < cumulativeDuration) {
          setCurrentStep(i);
          break;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            {type === "website" ? "Analyzing Website..." : "Analyzing PDF..."}
          </h2>
          <p className="text-muted-foreground">
            {type === "website"
              ? "We're extracting sponsorship information from your website"
              : `Processing ${fileName || "your document"}...`}
          </p>
          
          <div className="space-y-3 mt-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm font-medium text-primary">
              {steps[currentStep]?.label}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};

export default AnalysisSpinner;
