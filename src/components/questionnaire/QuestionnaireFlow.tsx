import { useState } from "react";
import { MultiStepOfferData, EnhancedSponsorshipPackage } from "@/types/flow";
import MultiStepContainer from "./MultiStepContainer";
import FundraisingGoalStep from "./FundraisingGoalStep";
import ImpactSelectionStep from "./ImpactSelectionStep";
import SupportedPlayersStep from "./SupportedPlayersStep";
import DurationSelectionStep from "./DurationSelectionStep";
import PackageBuilderStep from "./PackageBuilderStep";

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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [formData, setFormData] = useState<MultiStepOfferData>({
    currentStep: 1,
  });

  const handleNext = () => {
    if (currentStepIndex < TOTAL_STEPS - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCanProceed(false);
    } else {
      // Complete the questionnaire
      onComplete(formData);
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

  const renderCurrentStep = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <FundraisingGoalStep
            initialValue={formData.fundraisingGoal}
            onValueChange={(value) =>
              setFormData({ ...formData, fundraisingGoal: value })
            }
            onValidityChange={setCanProceed}
          />
        );
      case 1:
        return (
          <ImpactSelectionStep
            initialValues={formData.impactTags}
            onValueChange={(values) =>
              setFormData({ ...formData, impactTags: values })
            }
            onValidityChange={setCanProceed}
          />
        );
      case 2:
        return (
          <SupportedPlayersStep
            initialValue={formData.supportedPlayers}
            onValueChange={(value) =>
              setFormData({ ...formData, supportedPlayers: value })
            }
            onValidityChange={setCanProceed}
          />
        );
      case 3:
        return (
          <DurationSelectionStep
            initialValue={formData.duration}
            onValueChange={(value) =>
              setFormData({ ...formData, duration: value })
            }
            onValidityChange={setCanProceed}
          />
        );
      case 4:
        return (
          <PackageBuilderStep
            initialPackages={formData.packages}
            onValueChange={(packages) =>
              setFormData({ ...formData, packages })
            }
            onValidityChange={setCanProceed}
          />
        );
      default:
        return null;
    }
  };

  return (
    <MultiStepContainer
      currentStep={currentStepIndex + 1}
      totalSteps={TOTAL_STEPS}
      onNext={handleNext}
      onBack={handleBackClick}
      canProceed={canProceed}
      showBackButton={true}
      stepLabel={stepLabels[currentStepIndex]}
    >
      {renderCurrentStep()}
    </MultiStepContainer>
  );
};

export default QuestionnaireFlow;
