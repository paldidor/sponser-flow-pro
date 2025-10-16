import LoadingState from "@/components/LoadingState";
import SponsorshipReview from "@/components/SponsorshipReview";
import type { TeamProfile } from "@/types/flow";

interface ReviewStepProps {
  offerId?: string;
  offerData: any;
  teamData: TeamProfile | null;
  isLoading: boolean;
  loadingMessage: string;
  onApprove: () => Promise<void>;
  onBack: () => void;
}

export const ReviewStep = ({
  offerId,
  offerData,
  teamData,
  isLoading,
  loadingMessage,
  onApprove,
  onBack,
}: ReviewStepProps) => {
  if (!offerData || isLoading || !offerId) {
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
      offerId={offerId}
      sponsorshipData={offerData}
      teamData={teamData}
      onApprove={onApprove}
      onBack={onBack}
    />
  );
};
