import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { BusinessDashboardHeader } from "@/components/business/BusinessDashboardHeader";
import { MetricsCard } from "@/components/business/MetricsCard";
import { PerformanceChart } from "@/components/business/PerformanceChart";
import { SponsorshipTable } from "@/components/business/SponsorshipTable";
import { AIPreferencesModal } from "@/components/business/AIPreferencesModal";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AIAdvisorChat } from "@/components/business/AIAdvisorChat";
import { supabase } from "@/integrations/supabase/client";
const BusinessDashboard = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    profile,
    loading,
    refetch
  } = useBusinessProfile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [checkingPreferences, setCheckingPreferences] = useState(true);

  // Onboarding verification - redirect if not completed
  useEffect(() => {
    if (!loading && profile) {
      const isComplete = profile.onboarding_completed === true && profile.current_onboarding_step === 'completed';
      if (!isComplete) {
        toast({
          title: "Complete Your Profile",
          description: "Please finish setting up your business profile to access the dashboard.",
          variant: "default"
        });
        navigate("/business/onboarding", {
          replace: true
        });
      }
    }
  }, [profile, loading, navigate, toast]);

  // Check for AI preferences - show modal if missing
  useEffect(() => {
    const checkPreferences = async () => {
      if (!profile?.user_id || !profile?.onboarding_completed) {
        setCheckingPreferences(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCheckingPreferences(false);
          return;
        }

        const { data, error } = await supabase
          .from('ai_user_preferences')
          .select('interaction_patterns')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking preferences:', error);
        }

        // Show modal if no preferences OR preferences not marked as completed
        const interactionPatterns = data?.interaction_patterns as { preferences_completed?: boolean } | null;
        const preferencesCompleted = interactionPatterns?.preferences_completed === true;
        
        if (!data || !preferencesCompleted) {
          console.log('📋 No preferences found or incomplete, showing modal');
          setShowPreferencesModal(true);
        }
      } catch (error) {
        console.error('Exception checking preferences:', error);
      } finally {
        setCheckingPreferences(false);
      }
    };

    checkPreferences();
  }, [profile]);

  const handlePreferencesComplete = () => {
    setShowPreferencesModal(false);
    toast({
      title: "Preferences Saved",
      description: "Your AI advisor is ready to find sponsorship opportunities!",
    });
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Dashboard data updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh dashboard data.",
        variant: "destructive"
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
  if (loading || checkingPreferences) {
    return <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading your dashboard...' : 'Checking your preferences...'}
          </p>
        </div>
      </div>;
  }

  // Error state - profile not found
  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="mt-2 space-y-4">
            <p>Unable to load your business profile. Please try again.</p>
            <Button onClick={handleRefresh} disabled={isRefreshing} className="w-full">
              {isRefreshing ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </> : "Try Again"}
            </Button>
          </AlertDescription>
        </Alert>
      </div>;
  }

  // Format location for display
  const location = profile.city && profile.state ? `${profile.city}, ${profile.state}` : undefined;
  return <div className="min-h-screen bg-background">
      <BusinessDashboardHeader businessName={profile.business_name} location={location} industry={profile.industry} logoUrl={profile.sources?.logo_url as string | undefined} notificationCount={0} onEditProfile={handleEditProfile} onLogoUpdated={handleLogoUpdated} />

      <main className="p-6 space-y-6">
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <MetricsCard title="Total Spend" value="$8,700" color="green" icon="dollar" />
          <MetricsCard title="Sponsorships" value="12" subtitle="4 placements" color="blue" icon="target" />
          <MetricsCard title="Est. Reach" value="300K" subtitle="weekly views" color="purple" icon="eye" />
          <MetricsCard title="Engagement" value="1,053" subtitle="total interactions" color="blue" icon="users" />
          <MetricsCard title="Impact" value="847" subtitle="players supported" color="yellow" icon="trending" />
        </div>

        {/* Performance Chart */}
        <PerformanceChart />

        {/* Active Sponsorships Table */}
        <SponsorshipTable />

        {/* Coming Soon Section */}
        
      </main>

      {/* AI Advisor Chat Widget */}
      <AIAdvisorChat />

      {/* AI Preferences Modal */}
      <AIPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onComplete={handlePreferencesComplete}
        businessProfile={{
          city: profile.city,
          state: profile.state,
          industry: profile.industry,
        }}
      />
    </div>;
};
export default BusinessDashboard;