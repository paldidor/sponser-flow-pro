import { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MultiStepOfferData } from "@/types/flow";
import { useSwipe } from "@/hooks/use-swipe";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const containerRef = useFocusTrap<HTMLDivElement>(true);

  // Swipe gesture support for mobile
  const { isSwiping } = useSwipe({
    onSwipeLeft: () => {
      if (canProceed && currentStep < totalSteps) {
        setDirection("forward");
        onNext();
      }
    },
    onSwipeRight: () => {
      if (currentStep > 1) {
        setDirection("backward");
        onBack();
      }
    },
    threshold: 75,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Enter" && canProceed && !e.shiftKey) {
        setDirection("forward");
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canProceed, onNext]);

  // Announce step changes for screen readers
  useEffect(() => {
    const announcement = `Step ${currentStep} of ${totalSteps}: ${stepLabel}`;
    const ariaLive = document.getElementById("step-announcement");
    if (ariaLive) {
      ariaLive.textContent = announcement;
    }
  }, [currentStep, totalSteps, stepLabel]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background"
      role="main"
      aria-label="Multi-step questionnaire"
    >
      {/* Screen reader announcements */}
      <div
        id="step-announcement"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Progress Bar */}
        <div className="mb-8 space-y-2" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span aria-label={`Step ${currentStep} of ${totalSteps}`}>
              Step {currentStep} of {totalSteps}
            </span>
            <span aria-label={`${Math.round(progressPercentage)} percent complete`}>
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 transition-all duration-500 ease-out" 
          />
          <p className="text-xs text-muted-foreground" id="step-label">
            {stepLabel}
          </p>
        </div>

        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={() => {
              setDirection("backward");
              onBack();
            }}
            className="mb-6 -ml-2 touch-manipulation min-h-[44px]"
            aria-label={`Go back to step ${currentStep - 1}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back
          </Button>
        )}

        {/* Step Content with animation */}
        <div
          className={`mb-8 ${
            direction === "forward"
              ? "animate-fade-in"
              : "animate-fade-in"
          }`}
          aria-describedby="step-label"
        >
          {children}
        </div>

        {/* Mobile swipe hint */}
        {isMobile && currentStep < totalSteps && (
          <div className="mb-4 text-center animate-fade-in">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              💡 Swipe left to continue or right to go back
            </p>
          </div>
        )}

        {/* Next Button - Fixed at bottom on mobile */}
        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 -mx-4 sm:relative sm:border-0 sm:p-0 sm:bg-transparent z-10">
          <Button
            onClick={() => {
              setDirection("forward");
              onNext();
            }}
            disabled={!canProceed}
            size="lg"
            className="w-full sm:w-auto sm:min-w-[200px] touch-manipulation min-h-[44px] transition-all hover:scale-105 disabled:hover:scale-100"
            aria-label={
              currentStep === totalSteps
                ? "Complete questionnaire"
                : `Continue to step ${currentStep + 1}`
            }
          >
            {currentStep === totalSteps ? "Complete" : "Continue"}
            <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </Button>
          
          {/* Keyboard hint for desktop */}
          {!isMobile && canProceed && (
            <p className="text-xs text-muted-foreground mt-2 text-center sm:text-left animate-fade-in">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiStepContainer;
