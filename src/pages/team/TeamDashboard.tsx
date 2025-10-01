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

const TeamDashboard = () => {
  const { data: metrics, isLoading, isError, error, refetch } = useTeamDashboardData();

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
