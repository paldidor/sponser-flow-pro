import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { BusinessDashboardHeader } from "@/components/business/BusinessDashboardHeader";
import { MetricsCard } from "@/components/business/MetricsCard";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AIAdvisorChat } from "@/components/business/AIAdvisorChat";

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading, refetch } = useBusinessProfile();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Onboarding verification - redirect if not completed
  useEffect(() => {
    if (!loading && profile) {
      const isComplete = 
        profile.onboarding_completed === true && 
        profile.current_onboarding_step === 'completed';
      
      if (!isComplete) {
        toast({
          title: "Complete Your Profile",
          description: "Please finish setting up your business profile to access the dashboard.",
          variant: "default",
        });
        navigate("/business/onboarding", { replace: true });
      }
    }
  }, [profile, loading, navigate, toast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Dashboard data updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    navigate("/business/onboarding");
  };

  const handleLogoUpdated = () => {
    refetch();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state - profile not found
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="mt-2 space-y-4">
            <p>Unable to load your business profile. Please try again.</p>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="w-full"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Try Again"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Format location for display
  const location = profile.city && profile.state 
    ? `${profile.city}, ${profile.state}` 
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <BusinessDashboardHeader
        businessName={profile.business_name}
        location={location}
        industry={profile.industry}
        logoUrl={profile.sources?.logo_url as string | undefined}
        notificationCount={0}
        onEditProfile={handleEditProfile}
        onLogoUpdated={handleLogoUpdated}
      />

      <main className="p-6 space-y-6">
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <MetricsCard
            title="Total Spend"
            value="$8,700"
            color="green"
            icon="dollar"
          />
          <MetricsCard
            title="Sponsorships"
            value="12"
            subtitle="4 placements"
            color="blue"
            icon="target"
          />
          <MetricsCard
            title="Est. Reach"
            value="300K"
            subtitle="weekly views"
            color="purple"
            icon="eye"
          />
          <MetricsCard
            title="Engagement"
            value="1,053"
            subtitle="total interactions"
            color="blue"
            icon="users"
          />
          <MetricsCard
            title="Impact"
            value="847"
            subtitle="players supported"
            color="yellow"
            icon="trending"
          />
        </div>

        {/* Coming Soon Section */}
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-semibold text-foreground">
              More Dashboard Features Coming Soon
            </h2>
            <p className="text-muted-foreground max-w-md">
              We're building an amazing dashboard experience for your business. 
              Check back soon!
            </p>
          </div>
        </div>
      </main>

      {/* AI Advisor Chat Widget */}
      <AIAdvisorChat />
    </div>
  );
};

export default BusinessDashboard;
