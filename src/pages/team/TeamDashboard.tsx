import { DashboardHeader } from "@/components/team/DashboardHeader";

const TeamDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader teamName="Thunder Youth Soccer" notificationCount={3} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Overview Section - Coming in Phase 2 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Overview</h2>
          <div className="bg-muted/30 rounded-lg p-12 text-center">
            <p className="text-muted-foreground">
              Dashboard metrics and sections coming soon...
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TeamDashboard;
