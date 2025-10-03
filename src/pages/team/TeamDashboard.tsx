import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/team/DashboardHeader";
import { OverviewSection } from "@/components/team/OverviewSection";
import { SponsorshipOffersSection } from "@/components/team/SponsorshipOffersSection";
import { ActivationTasksSection } from "@/components/team/ActivationTasksSection";
import { ActiveSponsorsSection } from "@/components/team/ActiveSponsorsSection";
import { useTeamDashboardData } from "@/hooks/useTeamDashboardData";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryErrorBoundary } from "@/components/QueryErrorBoundary";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TeamDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: metrics, isLoading, isError, error, refetch } = useTeamDashboardData();

  // DEFENSIVE CHECK: Verify onboarding is actually completed
  // Safety net in case route guards fail
  useEffect(() => {
    const verifyOnboardingComplete = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('[TeamDashboard] No user, redirecting to auth');
          navigate('/auth', { replace: true });
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('team_profiles')
          .select('onboarding_completed, current_onboarding_step')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('[TeamDashboard] Error checking profile:', profileError);
          return; // Allow dashboard to load on error
        }

        // CRITICAL: Block access if onboarding not fully completed
        const isFullyComplete = profile?.onboarding_completed && profile?.current_onboarding_step === 'completed';
        
        if (!isFullyComplete) {
          console.log('[TeamDashboard] Onboarding incomplete, redirecting', {
            onboarding_completed: profile?.onboarding_completed,
            current_onboarding_step: profile?.current_onboarding_step,
          });
          
          toast({
            title: "Complete Onboarding First",
            description: "Please finish setting up your profile before accessing the dashboard.",
            variant: "destructive",
          });
          
          navigate('/team/onboarding', { replace: true });
        }
      } catch (error) {
        console.error('[TeamDashboard] Unexpected error in verification:', error);
      }
    };

    verifyOnboardingComplete();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load dashboard</AlertTitle>
            <AlertDescription className="mt-2">
              {error instanceof Error ? error.message : 'An error occurred while loading your dashboard data'}
            </AlertDescription>
          </Alert>
          <button 
            onClick={() => refetch()}
            className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          teamName={metrics?.teamName || "Your Team"} 
          notificationCount={0} 
        />
        
        <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
          <OverviewSection 
            totalRevenue={metrics?.totalRevenue || 0}
            potentialRevenue={metrics?.potentialRevenue || 0}
            activeSponsors={metrics?.activeSponsors || 0}
            openTasks={metrics?.openTasks || 0}
          />
          
          <SponsorshipOffersSection />
          
          <ActivationTasksSection />
          
          <ActiveSponsorsSection />
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default TeamDashboard;
