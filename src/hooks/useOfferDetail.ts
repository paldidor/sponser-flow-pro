import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SponsorshipData, TeamProfile, SponsorshipPackage } from "@/types/flow";

interface OfferDetailData {
  sponsorshipData: SponsorshipData;
  teamData: TeamProfile;
}

export const useOfferDetail = (offerId: string | undefined) => {
  return useQuery({
    queryKey: ["offer-detail", offerId],
    enabled: !!offerId,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    retry: 2,
    queryFn: async () => {
      if (!offerId) throw new Error("Offer ID is required");

      // Fetch sponsorship offer with team profile
      const { data: offer, error: offerError } = await supabase
        .from("sponsorship_offers")
        .select(`
          *,
          team_profiles (
            *
          )
        `)
        .eq("id", offerId)
        .eq("status", "published")
        .maybeSingle();

      if (offerError) throw offerError;
      if (!offer) throw new Error("Sponsorship offer not found");

      // Fetch packages with placements
      const { data: packages, error: packagesError } = await supabase
        .from("sponsorship_packages")
        .select(`
          *,
          package_placements (
            placement_options (
              id,
              name,
              category,
              description,
              is_popular
            )
          )
        `)
        .eq("sponsorship_offer_id", offerId)
        .order("package_order", { ascending: true });

      if (packagesError) throw packagesError;

      // Transform team profile data
      const teamProfile = Array.isArray(offer.team_profiles) 
        ? offer.team_profiles[0] 
        : offer.team_profiles;

      const teamData: TeamProfile = {
        team_name: teamProfile?.team_name || "Team Name Not Available",
        main_values: Array.isArray(teamProfile?.main_values) 
          ? teamProfile.main_values 
          : [],
        location: teamProfile?.location || "",
        team_bio: teamProfile?.team_bio || "",
        sport: teamProfile?.sport || "",
        number_of_players: teamProfile?.number_of_players || "",
        level_of_play: teamProfile?.level_of_play || "",
        competition_scope: teamProfile?.competition_scope || "",
        season_start_date: teamProfile?.season_start_date || undefined,
        season_end_date: teamProfile?.season_end_date || undefined,
        organization_status: teamProfile?.organization_status || "",
        instagram_link: teamProfile?.instagram_link || undefined,
        facebook_link: teamProfile?.facebook_link || undefined,
        linkedin_link: teamProfile?.linkedin_link || undefined,
        youtube_link: teamProfile?.youtube_link || undefined,
        twitter_link: teamProfile?.twitter_link || undefined,
        instagram_followers: teamProfile?.instagram_followers || undefined,
        facebook_followers: teamProfile?.facebook_followers || undefined,
        linkedin_followers: teamProfile?.linkedin_followers || undefined,
        twitter_followers: teamProfile?.twitter_followers || undefined,
        youtube_followers: teamProfile?.youtube_followers || undefined,
        email_list_size: teamProfile?.email_list_size || undefined,
      };

      // Transform packages data
      const transformedPackages: SponsorshipPackage[] = (packages || []).map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        price: Number(pkg.price),
        benefits: Array.isArray(pkg.benefits) ? pkg.benefits : [],
        placements: (pkg.package_placements || [])
          .map((pp: any) => pp.placement_options?.name)
          .filter(Boolean),
      }));

      // Transform sponsorship data
      const sponsorshipData: SponsorshipData = {
        fundraisingGoal: String(offer.fundraising_goal),
        duration: offer.duration,
        description: offer.description || offer.impact || "",
        packages: transformedPackages,
        source: offer.source as "form" | "website" | "pdf" | "questionnaire",
        sourceUrl: offer.source === "website" ? teamProfile?.seed_url : undefined,
        fileName: offer.source_file_name || undefined,
      };

      const result: OfferDetailData = {
        sponsorshipData,
        teamData,
      };

      return result;
    },
  });
};
