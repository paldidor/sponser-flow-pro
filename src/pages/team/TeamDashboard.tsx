import { useEffect, useState } from "react";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreateOfferFlow from "@/components/team/CreateOfferFlow";
import { TeamProfileEditor } from "@/components/team/TeamProfileEditor";
import { TeamProfile } from "@/types/flow";

const TeamDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: metrics, isLoading, isError, error, refetch } = useTeamDashboardData();
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [teamProfile, setTeamProfile] = useState<TeamProfile | null>(null);

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

  // FIRST-RUN CHECK: Auto-open Create Offer modal if no published offers exist
  useEffect(() => {
    const checkFirstRun = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: offers, error } = await supabase
          .from('sponsorship_offers')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'published')
          .limit(1);

        if (error) {
          console.error('[TeamDashboard] Error checking offers:', error);
          return;
        }

        // No published offers = first time user, auto-open modal
        if (!offers || offers.length === 0) {
          console.log('[TeamDashboard] No offers found, opening Create Offer modal');
          setShowCreateOfferModal(true);
        }
      } catch (error) {
        console.error('[TeamDashboard] Unexpected error checking first run:', error);
      }
    };

    checkFirstRun();
  }, []);

  // Load team profile data
  const loadTeamProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('team_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[TeamDashboard] Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load team profile",
          variant: "destructive",
        });
        return;
      }

      if (profile) {
        setTeamProfile(profile as TeamProfile);
      }
    } catch (error) {
      console.error('[TeamDashboard] Unexpected error loading profile:', error);
    }
  };

  // Handle opening profile editor
  const handleOpenProfileEditor = async () => {
    await loadTeamProfile();
    setShowProfileEditor(true);
  };

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
          location={metrics?.location}
          sport={metrics?.sport}
          logoUrl={metrics?.logo}
          notificationCount={0}
          onEditProfile={handleOpenProfileEditor}
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

        {/* First-Run Create Offer Modal */}
        <Dialog open={showCreateOfferModal} onOpenChange={setShowCreateOfferModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">Create Your First Sponsorship Offer</DialogTitle>
            <CreateOfferFlow
              onComplete={() => {
                setShowCreateOfferModal(false);
                refetch(); // Refresh dashboard data
                toast({
                  title: "Offer Created!",
                  description: "Your sponsorship offer has been created successfully.",
                });
              }}
              onCancel={() => setShowCreateOfferModal(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Profile Editor Modal */}
        <TeamProfileEditor
          open={showProfileEditor}
          onOpenChange={setShowProfileEditor}
          profileData={teamProfile}
          onSave={() => {
            setShowProfileEditor(false);
            refetch(); // Refresh dashboard metrics
            toast({
              title: "Profile Updated",
              description: "Your team profile has been updated successfully.",
            });
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default TeamDashboard;
