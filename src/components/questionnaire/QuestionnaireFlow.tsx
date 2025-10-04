import { MultiStepOfferData } from "@/types/flow";
import MultiStepContainer from "./MultiStepContainer";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuestionnaireState } from "@/hooks/useQuestionnaireState";
import { useAutoSave } from "@/hooks/useAutoSave";
import { QuestionnaireStepRenderer } from "./QuestionnaireStepRenderer";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { SubmittingOverlay } from "./SubmittingOverlay";

interface QuestionnaireFlowProps {
  onComplete: (data: MultiStepOfferData) => void;
  onBack: () => void;
}

const TOTAL_STEPS = 5;

const stepLabels = [
  "Setting your fundraising goal",
  "Defining impact areas",
  "Team information",
  "Sponsorship duration",
  "Building packages",
];

const QuestionnaireFlow = ({ onComplete, onBack }: QuestionnaireFlowProps) => {
  const {
    currentStepIndex,
    setCurrentStepIndex,
    canProceed,
    setCanProceed,
    formData,
    setFormData,
    offerId,
    isInitializing,
    isSubmitting,
    handleComplete,
  } = useQuestionnaireState({ onComplete, onBack });

  const { isSaving, lastSaved, saveProgress } = useAutoSave({
    offerId,
    formData,
    isInitializing,
    isSubmitting,
  });

  const handleNext = async () => {
    // Save current step before proceeding
    if (offerId) {
      await saveProgress();
    }

    if (currentStepIndex < TOTAL_STEPS - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCanProceed(false);
    } else {
      // Final step - finalize and publish
      await handleComplete();
    }
  };

  const handleBackClick = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCanProceed(true); // Can always go forward from previous steps
    } else {
      onBack();
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 space-y-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Setting up your questionnaire...</p>
            <p className="text-sm text-muted-foreground">This will only take a moment</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />

      <MultiStepContainer
        currentStep={currentStepIndex + 1}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onBack={handleBackClick}
        canProceed={canProceed && !isSubmitting}
        showBackButton={true}
        stepLabel={stepLabels[currentStepIndex]}
      >
        <QuestionnaireStepRenderer
          currentStepIndex={currentStepIndex}
          formData={formData}
          onFormDataChange={setFormData}
          onValidityChange={setCanProceed}
        />
      </MultiStepContainer>

      <SubmittingOverlay isSubmitting={isSubmitting} />
    </div>
  );
};

export default QuestionnaireFlow;
