import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SponsorshipPackage } from "@/types/dashboard";

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

      // Fetch sponsorship offers with packages
      const { data: offers, error: offersError } = await supabase
        .from("sponsorship_offers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (offersError) throw offersError;

      if (!offers || offers.length === 0) return [];

      // Fetch packages for all offers with sponsors data
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
        .in("sponsorship_offer_id", offers.map(o => o.id))
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
        // Check if this package has a sponsor (is sold)
        const hasSponsor = pkg.sponsors && pkg.sponsors.length > 0;
        const sponsor = hasSponsor ? pkg.sponsors[0] : null;
        
        // Status now comes directly from the database
        const status: SponsorshipPackage["status"] = pkg.status || "live";

        return {
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          description: pkg.description,
          sponsorship_offer_id: pkg.sponsorship_offer_id,
          package_order: pkg.package_order,
          status,
          duration: offers[0]?.duration || "1 year",
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

      return transformedPackages;
    },
  });
};
