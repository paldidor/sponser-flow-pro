import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Globe, Briefcase, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

interface BusinessProfileReviewProps {
  onEdit: () => void;
  onComplete: () => void;
}

const BusinessProfileReview = ({ onEdit, onComplete }: BusinessProfileReviewProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const { profile, completeOnboarding } = useBusinessProfile();
  const { toast } = useToast();

  const handleApprove = async () => {
    if (!profile) {
      toast({
        title: "No profile found",
        description: "Please complete your profile first",
        variant: "destructive",
      });
      return;
    }

    setIsCompleting(true);

    try {
      const { error } = await completeOnboarding();

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Welcome to Sponsa! Let's explore sponsorship opportunities.",
      });

      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onComplete();
    } catch (error: any) {
      console.error('Error completing business onboarding:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete profile. Please try again.",
        variant: "destructive",
      });
      setIsCompleting(false);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Review Your Profile</h2>
        <p className="text-muted-foreground text-lg">
          Please review your business information before completing setup
        </p>
      </div>

      <Card>
        <CardContent className="p-8 space-y-6">
          {/* Business Name */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Business Name</p>
              <p className="text-lg font-semibold">{profile.business_name}</p>
            </div>
          </div>

          {/* Industry */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Industry</p>
              <p className="text-lg font-semibold">{profile.industry}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <p className="text-lg font-semibold">
                {profile.city}, {profile.state}
              </p>
            </div>
          </div>

          {/* Website */}
          {profile.website && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Website</p>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-primary hover:underline"
                >
                  {profile.website}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onEdit}
          className="flex-1"
          disabled={isCompleting}
        >
          Edit Information
        </Button>
        <Button
          onClick={handleApprove}
          className="flex-1"
          disabled={isCompleting}
        >
          {isCompleting ? "Completing..." : "Approve & Complete"}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        You can always update your profile later from your dashboard
      </p>
    </div>
  );
};

export default BusinessProfileReview;
