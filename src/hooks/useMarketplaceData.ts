import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Opportunity } from "@/types/marketplace";
import { transformToOpportunity } from "@/lib/marketplaceUtils";

export const useMarketplaceData = () => {
  return useQuery({
    queryKey: ["marketplace-opportunities"],
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data: offers, error } = await supabase
        .from("sponsorship_offers")
        .select(`
          id,
          title,
          fundraising_goal,
          duration,
          created_at,
          team_profile_id,
          team_profiles (
            team_name,
            organization_status,
            sport,
            location,
            number_of_players,
            level_of_play,
            competition_scope,
            instagram_followers,
            facebook_followers,
            twitter_followers,
            reach
          ),
          sponsorship_packages!inner (
            id,
            price,
            status
          )
        `)
        .eq("status", "published")
        .in("sponsorship_packages.status", ["live", "sold-active"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter out offers with no visible packages
      const validOffers = (offers || []).filter(offer => 
        offer.sponsorship_packages && offer.sponsorship_packages.length > 0
      );

      console.log(`[Marketplace] Filtered ${(offers || []).length} offers to ${validOffers.length} with visible packages`);

      const opportunities: Opportunity[] = validOffers.map(offer => 
        transformToOpportunity({
          ...offer,
          team_profile: Array.isArray(offer.team_profiles) 
            ? offer.team_profiles[0] 
            : offer.team_profiles,
          packages: offer.sponsorship_packages,
        })
      );

      return opportunities;
    },
  });
};
