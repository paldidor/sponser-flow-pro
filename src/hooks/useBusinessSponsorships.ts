import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BusinessSponsorship } from "@/types/dashboard";

export const useBusinessSponsorships = () => {
  return useQuery({
    queryKey: ["business-sponsorships"],
    queryFn: async (): Promise<BusinessSponsorship[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Fetch sponsorships from the business user's perspective
      const { data, error } = await supabase
        .from("sponsors")
        .select(`
          id,
          name,
          package_id,
          sponsorship_packages!inner (
            id,
            name,
            price,
            status,
            sponsorship_offer_id,
            sponsorship_offers!inner (
              id,
              title,
              team_profile_id,
              team_profiles!inner (
                id,
                team_name,
                sport,
                location,
                reach,
                level_of_play
              )
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching sponsorships:", error);
        throw error;
      }

      // Transform data into table format
      return (data || []).map((sponsor) => {
        const pkg = sponsor.sponsorship_packages;
        const offer = pkg?.sponsorship_offers;
        const team = offer?.team_profiles;

        // Map database status to display status
        const mapStatus = (dbStatus: string): 'Active' | 'Activation' | 'Inactive' => {
          switch (dbStatus) {
            case 'sold-active':
              return 'Active';
            case 'live':
              return 'Activation';
            case 'inactive':
            case 'draft':
            default:
              return 'Inactive';
          }
        };

        // Calculate metrics
        const reach = team?.reach || 0;
        const weeklyExposure = Math.round(reach / 4);
        const estimatedClicks = Math.round(reach / 200);
        const estimatedConversions = Math.round(estimatedClicks / 20);

        return {
          id: sponsor.id,
          team: team?.team_name || 'Unknown Team',
          status: mapStatus(pkg?.status || 'inactive'),
          teamType: team?.level_of_play || 'Recreation',
          location: team?.location || 'Unknown',
          sport: team?.sport || 'Unknown',
          amount: `$${(pkg?.price || 0).toLocaleString()}`,
          exposure: weeklyExposure >= 1000 
            ? `${Math.round(weeklyExposure / 1000)}K` 
            : weeklyExposure.toString(),
          clicks: estimatedClicks,
          conversions: estimatedConversions,
          packageName: pkg?.name || 'Unknown Package',
          teamId: team?.id || '',
          packageId: pkg?.id || '',
        };
      });
    },
  });
};
