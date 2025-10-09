import LoadingState from "@/components/LoadingState";
import SponsorshipReview from "@/components/SponsorshipReview";
import type { TeamProfile } from "@/types/flow";

interface ReviewStepProps {
  offerData: any;
  teamData: TeamProfile | null;
  isLoading: boolean;
  loadingMessage: string;
  onApprove: () => Promise<void>;
  onBack: () => void;
}

export const ReviewStep = ({
  offerData,
  teamData,
  isLoading,
  loadingMessage,
  onApprove,
  onBack,
}: ReviewStepProps) => {
  if (!offerData || isLoading) {
    return (
      <LoadingState 
        variant="page"
        size="lg"
        message={loadingMessage || "Loading Offer Details"}
        submessage="Preparing your sponsorship offer for review..."
      />
    );
  }

  return (
    <SponsorshipReview
      sponsorshipData={offerData}
      teamData={teamData}
      onApprove={onApprove}
      onBack={onBack}
    />
  );
};
