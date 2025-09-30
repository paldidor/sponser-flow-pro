import { useEffect, useState } from "react";
import { Loader2, FileText, Globe } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface AnalysisSpinnerProps {
  type: "website" | "pdf";
  fileName?: string;
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

const AnalysisSpinner = ({ type, fileName }: AnalysisSpinnerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = type === "pdf" ? pdfSteps : websiteSteps;

  useEffect(() => {
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
      setProgress(Math.min(progressPercentage, 95));
    }, 100);

    return () => clearInterval(progressInterval);
  }, [steps]);

  const Icon = type === "pdf" ? FileText : Globe;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="max-w-lg w-full p-8 space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-12 h-12 text-primary/40 absolute" />
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-bold">
            Analyzing {type === "pdf" ? "Your PDF" : "Website"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {fileName ? (
              <span className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                {fileName}
              </span>
            ) : (
              "Extracting sponsorship information..."
            )}
          </p>
        </div>

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

        <div className="pt-4 border-t">
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>AI-powered analysis in progress</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalysisSpinner;
