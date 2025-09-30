import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MultiStepOfferData } from "@/types/flow";

interface MultiStepContainerProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  showBackButton?: boolean;
  stepLabel: string;
}

const MultiStepContainer = ({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canProceed,
  showBackButton = true,
  stepLabel,
}: MultiStepContainerProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Progress Bar */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">{stepLabel}</p>
        </div>

        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        {/* Step Content */}
        <div className="mb-8">
          {children}
        </div>

        {/* Next Button - Fixed at bottom on mobile */}
        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 -mx-4 sm:relative sm:border-0 sm:p-0 sm:bg-transparent">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            size="lg"
            className="w-full sm:w-auto sm:min-w-[200px]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultiStepContainer;
