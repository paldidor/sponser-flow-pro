import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActiveSponsor } from "@/types/dashboard";

export const useActiveSponsors = () => {
  return useQuery({
    queryKey: ["active-sponsors"],
    staleTime: 60000, // 1 minute - sponsor data doesn't change frequently
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false, // No need to refetch on focus for sponsor data
    retry: 2,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { data: sponsors, error: sponsorsError } = await supabase
        .from("sponsors")
        .select(`
          *,
          sponsorship_packages (
            name,
            price
          ),
          creative_assets (
            id,
            asset_name,
            asset_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (sponsorsError) throw sponsorsError;

      return (sponsors || []).map((sponsor: any) => ({
        id: sponsor.id,
        name: sponsor.name,
        logo_url: sponsor.logo_url,
        bio: sponsor.bio,
        website: sponsor.website,
        social_links: sponsor.social_links || {},
        package_type: sponsor.sponsorship_packages?.name || "Standard Package",
        creative_assets: sponsor.creative_assets?.map((asset: any) => asset.asset_url) || [],
      })) as ActiveSponsor[];
    },
  });
};
