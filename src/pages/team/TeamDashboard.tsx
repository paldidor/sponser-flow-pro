import { DashboardHeader } from "@/components/team/DashboardHeader";
import { OverviewSection } from "@/components/team/OverviewSection";
import { SponsorshipOffersSection } from "@/components/team/SponsorshipOffersSection";

const TeamDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader teamName="Thunder Youth Soccer" notificationCount={3} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <OverviewSection 
          totalRevenue={9000}
          potentialRevenue={19500}
          activeSponsors={3}
          openTasks={3}
        />
        
        <SponsorshipOffersSection />
        
        {/* Activation Tasks Section - Coming in Phase 4 */}
        <div className="bg-muted/30 rounded-lg p-12 text-center mb-8">
          <p className="text-muted-foreground">
            Activation tasks section coming next...
          </p>
        </div>
      </main>
    </div>
  );
};

export default TeamDashboard;
