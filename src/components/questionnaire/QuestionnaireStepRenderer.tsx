import { lazy, Suspense } from "react";
import { MultiStepOfferData, EnhancedSponsorshipPackage } from "@/types/flow";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load step components for better performance
const FundraisingGoalStep = lazy(() => import("./FundraisingGoalStep"));
const ImpactSelectionStep = lazy(() => import("./ImpactSelectionStep"));
const SupportedPlayersStep = lazy(() => import("./SupportedPlayersStep"));
const DurationSelectionStep = lazy(() => import("./DurationSelectionStep"));
const PackageBuilderStep = lazy(() => import("./PackageBuilderStep"));

interface QuestionnaireStepRendererProps {
  currentStepIndex: number;
  formData: MultiStepOfferData;
  onFormDataChange: (data: MultiStepOfferData) => void;
  onValidityChange: (isValid: boolean) => void;
}

// Loading fallback for lazy-loaded components
const StepLoadingFallback = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-3">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-6 w-full" />
    </div>
    <Card className="p-6 space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </Card>
  </div>
);

export function QuestionnaireStepRenderer({
  currentStepIndex,
  formData,
  onFormDataChange,
  onValidityChange,
}: QuestionnaireStepRendererProps) {
  const renderStep = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <FundraisingGoalStep
            initialValue={formData.fundraisingGoal}
            onValueChange={(value) =>
              onFormDataChange({ ...formData, fundraisingGoal: value })
            }
            onValidityChange={onValidityChange}
          />
        );
      case 1:
        return (
          <ImpactSelectionStep
            initialValues={formData.impactTags}
            onValueChange={(values) =>
              onFormDataChange({ ...formData, impactTags: values })
            }
            onValidityChange={onValidityChange}
          />
        );
      case 2:
        return (
          <SupportedPlayersStep
            initialPlayers={formData.supportedPlayers}
            initialAttendance={formData.avgGameAttendance}
            initialSessions={formData.weeklyTrainingSessions}
            initialGames={formData.numberOfGames}
            onValueChange={(data) =>
              onFormDataChange({ 
                ...formData, 
                supportedPlayers: data.players,
                avgGameAttendance: data.attendance,
                weeklyTrainingSessions: data.sessions,
                numberOfGames: data.games
              })
            }
            onValidityChange={onValidityChange}
          />
        );
      case 3:
        return (
          <DurationSelectionStep
            initialValue={formData.duration}
            initialSeasonStart={formData.seasonStartDate}
            initialSeasonEnd={formData.seasonEndDate}
            initialDurationYears={formData.durationYears}
            onValueChange={(data) =>
              onFormDataChange({
                ...formData,
                duration: data.duration,
                seasonStartDate: data.seasonStartDate,
                seasonEndDate: data.seasonEndDate,
                durationYears: data.durationYears,
              })
            }
            onValidityChange={onValidityChange}
          />
        );
      case 4:
        return (
          <PackageBuilderStep
            initialPackages={formData.packages}
            onValueChange={(packages) =>
              onFormDataChange({ ...formData, packages })
            }
            onValidityChange={onValidityChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Suspense fallback={<StepLoadingFallback />}>
      {renderStep()}
    </Suspense>
  );
}
