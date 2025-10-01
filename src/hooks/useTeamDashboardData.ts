import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardMetrics {
  totalRevenue: number;
  potentialRevenue: number;
  activeSponsors: number;
  openTasks: number;
  teamName: string;
}

export const useTeamDashboardData = () => {
  return useQuery({
    queryKey: ["team-dashboard-metrics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      // Fetch team profile for team name
      const { data: teamProfile } = await supabase
        .from("team_profiles")
        .select("team_name")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch all sponsorship packages with their status
      const { data: packages, error: packagesError } = await supabase
        .from("sponsorship_packages")
        .select(`
          id,
          price,
          sponsorship_offer_id,
          sponsorship_offers!inner (
            user_id,
            status
          )
        `)
        .eq("sponsorship_offers.user_id", user.id);

      if (packagesError) throw packagesError;

      // Calculate potential revenue (sum of all package prices)
      const potentialRevenue = packages?.reduce((sum, pkg) => sum + Number(pkg.price), 0) || 0;

      // Fetch sponsors to get sold packages (active sponsors)
      const { data: sponsors } = await supabase
        .from("sponsors")
        .select("id, package_id")
        .eq("user_id", user.id);

      const soldPackageIds = new Set(sponsors?.map(s => s.package_id) || []);
      
      // Calculate total revenue from sold packages
      const totalRevenue = packages
        ?.filter(pkg => soldPackageIds.has(pkg.id))
        .reduce((sum, pkg) => sum + Number(pkg.price), 0) || 0;

      // Count active sponsors
      const activeSponsors = sponsors?.length || 0;

      // Fetch open activation tasks (not complete)
      const { data: tasks } = await supabase
        .from("activation_tasks")
        .select("id, status")
        .eq("user_id", user.id)
        .neq("status", "complete");

      const openTasks = tasks?.length || 0;

      return {
        totalRevenue,
        potentialRevenue,
        activeSponsors,
        openTasks,
        teamName: teamProfile?.team_name || "Your Team",
      } as DashboardMetrics;
    },
  });
};
