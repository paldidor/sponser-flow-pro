import CreateTeamProfile from "@/components/CreateTeamProfile";
import ProfileReview from "@/components/ProfileReview";
import { OnboardingStep } from "@/lib/onboardingHelpers";
import type { TeamProfile } from "@/types/flow";

interface ProfileCreationStepProps {
  currentStep: OnboardingStep;
  teamData: TeamProfile | null;
  isManualEntry: boolean;
  onStepChange: (step: OnboardingStep) => void;
  onManualEntryChange: (isManual: boolean) => void;
  onProfileUpdate: (profile: TeamProfile) => void;
  onProfileApprove: () => Promise<void>;
}

export const ProfileCreationStep = ({
  currentStep,
  teamData,
  isManualEntry,
  onStepChange,
  onManualEntryChange,
  onProfileUpdate,
  onProfileApprove,
}: ProfileCreationStepProps) => {
  if (currentStep === 'create-profile') {
    return (
      <CreateTeamProfile
        onAnalyzeWebsite={() => {
          onStepChange('profile-review');
        }}
        onFillManually={() => {
          onManualEntryChange(true);
          onStepChange('profile-review');
        }}
      />
    );
  }

  if (currentStep === 'profile-review') {
    return (
      <ProfileReview
        teamData={teamData}
        onApprove={onProfileApprove}
        isManualEntry={isManualEntry}
        onProfileUpdate={onProfileUpdate}
      />
    );
  }

  return null;
};
