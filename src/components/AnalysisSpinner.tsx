import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface AnalysisSpinnerProps {
  type: "website" | "pdf";
  fileName?: string;
}

const websiteSteps = [
  { label: "Scanning website structure", duration: 2000 },
  { label: "Analyzing team information", duration: 2500 },
  { label: "Extracting social media data", duration: 2000 },
  { label: "Processing content", duration: 2500 },
  { label: "Generating team profile", duration: 2000 },
];

const pdfSteps = [
  { label: "Uploading your sponsorship deck", duration: 2000 },
  { label: "Exploring and optimizing your deck", duration: 2500 },
  { label: "Extracting funding goals and packages", duration: 2500 },
  { label: "Analyzing sponsorship placements", duration: 2000 },
  { label: "Creating emotional effective offer", duration: 2500 },
];

const AnalysisSpinner = ({ type, fileName }: AnalysisSpinnerProps) => {
  const steps = type === "pdf" ? pdfSteps : websiteSteps;
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
            {type === "website" ? "Analyzing Website" : "Analyzing Sponsorship Deck"}
          </h2>
          <p className="text-muted-foreground">
            {type === "website"
              ? "We're extracting your team information from the website..."
              : "Exploring and optimizing your sponsorship deck to create an emotionally effective offer..."}
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
