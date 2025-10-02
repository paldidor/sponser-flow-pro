import { useParams, useNavigate } from "react-router-dom";
import { useOfferDetail } from "@/hooks/useOfferDetail";
import SponsorshipMarketplace from "@/components/SponsorshipMarketplace";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MarketplaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useOfferDetail(id);

  const handleBack = () => {
    navigate("/marketplace");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const is404 = error.message.includes("not found");
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {is404 ? "Opportunity Not Found" : "Error Loading Opportunity"}
            </AlertTitle>
            <AlertDescription>
              {is404
                ? "This sponsorship opportunity is no longer available or has been removed."
                : "We encountered an error while loading this sponsorship opportunity. Please try again later."}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-8">
            <Button onClick={handleBack}>
              Return to Marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render the sponsorship marketplace component
  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
      <SponsorshipMarketplace
        sponsorshipData={data.sponsorshipData}
        teamData={data.teamData}
      />
    </div>
  );
};

export default MarketplaceDetail;
