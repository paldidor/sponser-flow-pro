import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SponsorshipPackage, SponsorshipOfferWithPackages } from "@/types/dashboard";

export const useSponsorshipOffers = () => {
  return useQuery({
    queryKey: ["sponsorship-offers"],
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      // Fetch sponsorship offers (exclude deleted)
      const { data: offers, error: offersError } = await supabase
        .from("sponsorship_offers")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });

      if (offersError) throw offersError;

      if (!offers || offers.length === 0) {
        return { offers: [], totalPackages: 0 };
      }

      // Filter out empty draft offers (abandoned/incomplete)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const filteredOffers = offers.filter(offer => {
        // Keep all published offers
        if (offer.status === 'published') return true;
        
        // For drafts, only keep if they're recent (< 1 hour old)
        if (offer.status === 'draft') {
          const offerCreatedAt = new Date(offer.created_at);
          const isRecent = offerCreatedAt > oneHourAgo;
          return isRecent;
        }
        
        return true;
      });

      if (filteredOffers.length === 0) {
        return { offers: [], totalPackages: 0 };
      }

      // Fetch packages for filtered offers with sponsors data (exclude deleted)
      const { data: packages, error: packagesError } = await supabase
        .from("sponsorship_packages")
        .select(`
          *,
          package_placements (
            placement_option_id,
            placement_options (*)
          ),
          sponsors (
            id,
            name
          )
        `)
        .in("sponsorship_offer_id", filteredOffers.map(o => o.id))
        .neq("status", "deleted")
        .order("package_order", { ascending: true });

      if (packagesError) throw packagesError;

      // Fetch activation tasks to get open tasks count per package
      const { data: tasks } = await supabase
        .from("activation_tasks")
        .select("id, package_id, status")
        .eq("user_id", user.id)
        .neq("status", "complete");

      // Create a map of package_id to open tasks count
      const openTasksMap = new Map<string, number>();
      tasks?.forEach(task => {
        if (task.package_id) {
          openTasksMap.set(task.package_id, (openTasksMap.get(task.package_id) || 0) + 1);
        }
      });

      // Transform packages to include placements
      const transformedPackages: SponsorshipPackage[] = (packages || []).map((pkg: any) => {
        const hasSponsor = pkg.sponsors && pkg.sponsors.length > 0;
        const sponsor = hasSponsor ? pkg.sponsors[0] : null;
        const status: SponsorshipPackage["status"] = pkg.status || "live";

        return {
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          description: pkg.description,
          sponsorship_offer_id: pkg.sponsorship_offer_id,
          package_order: pkg.package_order,
          status,
          duration: pkg.duration || "1 year",
          sponsor_name: sponsor?.name,
          open_tasks: openTasksMap.get(pkg.id) || undefined,
          placements: pkg.package_placements?.map((pp: any) => ({
            id: pp.placement_options.id,
            name: pp.placement_options.name,
            category: pp.placement_options.category,
            description: pp.placement_options.description,
            is_popular: pp.placement_options.is_popular,
          })) || [],
          created_at: pkg.created_at,
          updated_at: pkg.updated_at,
        };
      });

      // Group packages by offer
      const offersWithPackages: SponsorshipOfferWithPackages[] = filteredOffers.map(offer => {
        const offerPackages = transformedPackages.filter(
          pkg => pkg.sponsorship_offer_id === offer.id
        );

        return {
          id: offer.id,
          title: offer.title,
          description: offer.description,
          duration: offer.duration,
          package_count: offerPackages.length,
          packages: offerPackages,
          created_at: offer.created_at,
          updated_at: offer.updated_at,
        };
      });

      return {
        offers: offersWithPackages,
        totalPackages: transformedPackages.length,
      };
    },
  });
};
