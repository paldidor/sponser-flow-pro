import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SponsorshipPackage } from "@/types/dashboard";

export const useSponsorshipOffers = () => {
  return useQuery({
    queryKey: ["sponsorship-offers"],
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

      // Fetch packages for all offers
      const { data: packages, error: packagesError } = await supabase
        .from("sponsorship_packages")
        .select(`
          *,
          package_placements (
            placement_option_id,
            placement_options (*)
          )
        `)
        .in("sponsorship_offer_id", offers.map(o => o.id))
        .order("package_order", { ascending: true });

      if (packagesError) throw packagesError;

      // Transform packages to include placements and mock status
      const transformedPackages: SponsorshipPackage[] = (packages || []).map((pkg: any, index: number) => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        sponsorship_offer_id: pkg.sponsorship_offer_id,
        package_order: pkg.package_order,
        // Mock status based on index for demo (you'll want to add this to the database)
        status: index === 0 ? "sold-active" as const : 
                index === 1 ? "live" as const : 
                index === 2 ? "sold-active" as const :
                index === 3 ? "sold-active" as const : "draft" as const,
        // Mock data (you'll want to fetch this from related tables)
        duration: offers[0]?.duration || "1 year",
        sponsor_name: index === 0 ? "Local Coffee Co." : 
                      index === 2 ? "Sports Gear Plus" :
                      index === 3 ? "Mike's Pizza" : undefined,
        open_tasks: index === 0 ? 2 : index === 2 ? 1 : index === 3 ? 1 : undefined,
        placements: pkg.package_placements?.map((pp: any) => ({
          id: pp.placement_options.id,
          name: pp.placement_options.name,
          category: pp.placement_options.category,
          description: pp.placement_options.description,
          is_popular: pp.placement_options.is_popular,
        })) || [],
        created_at: pkg.created_at,
        updated_at: pkg.updated_at,
      }));

      return transformedPackages;
    },
  });
};
