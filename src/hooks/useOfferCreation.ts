import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { SponsorshipData } from "@/types/flow";

export const useOfferCreation = () => {
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);
  const [offerData, setOfferData] = useState<SponsorshipData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loadOfferData = async (offerId: string, source: 'pdf' | 'questionnaire' = 'questionnaire') => {
    try {
      setIsLoading(true);
      setLoadingMessage("Fetching offer details from database...");
      
      const { data: offer, error: offerError } = await supabase
        .from('sponsorship_offers')
        .select(`
          *,
          sponsorship_packages (
            id,
            name,
            price,
            benefits,
            description,
            package_placements (
              placement_option_id,
              placement_options (
                id,
                name,
                category,
                description
              )
            )
          )
        `)
        .eq('id', offerId)
        .single();

      if (offerError) throw offerError;

      setLoadingMessage("Processing offer data...");

      const formattedData: SponsorshipData = {
        fundraisingGoal: offer.fundraising_goal?.toString() || '0',
        duration: offer.duration || 'TBD',
        description: offer.description || offer.impact || '',
        packages: offer.sponsorship_packages?.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          benefits: pkg.benefits || [],
          placements: pkg.package_placements?.map((pp: any) => 
            pp.placement_options?.name || ''
          ).filter(Boolean) || []
        })) || [],
        source,
        fileName: offer.source_file_name || undefined
      };

      setOfferData(formattedData);
      setCurrentOfferId(offerId);
      return formattedData;
    } catch (error) {
      console.error('Error loading offer data:', error);
      toast({
        title: "Error Loading Offer",
        description: "Failed to load offer details. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const loadLatestQuestionnaireOffer = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Authenticating...");
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        return null;
      }

      setLoadingMessage("Finding your latest offer...");

      const { data: offer, error } = await supabase
        .from('sponsorship_offers')
        .select(`
          *,
          sponsorship_packages (
            id,
            name,
            price,
            benefits,
            description,
            package_placements (
              placement_option_id,
              placement_options (
                id,
                name,
                category,
                description
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('source', 'questionnaire')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading latest offer:', error);
        return null;
      }

      if (offer) {
        return loadOfferData(offer.id, 'questionnaire');
      }

      return null;
    } catch (error) {
      console.error('Error loading latest questionnaire offer:', error);
      return null;
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const publishOffer = async (offerId?: string) => {
    const targetOfferId = offerId || currentOfferId;
    if (!targetOfferId) {
      toast({
        title: "Error",
        description: "No offer to publish.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      setLoadingMessage("Publishing your offer...");
      
      const { error } = await supabase
        .from('sponsorship_offers')
        .update({ status: 'published' })
        .eq('id', targetOfferId);

      if (error) throw error;

      // Invalidate all relevant queries to refresh dashboard
      await queryClient.invalidateQueries({ 
        queryKey: ['sponsorship-offers'], 
        exact: false 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['team-dashboard'], 
        exact: false 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['sponsorship-packages'], 
        exact: false 
      });

      toast({
        title: "Success!",
        description: "Your sponsorship offer has been published.",
      });
      return true;
    } catch (error) {
      console.error('Error publishing offer:', error);
      toast({
        title: "Error",
        description: "Failed to publish offer. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const resetOffer = () => {
    setCurrentOfferId(null);
    setOfferData(null);
    setIsLoading(false);
    setLoadingMessage("");
  };

  return {
    currentOfferId,
    offerData,
    isLoading,
    loadingMessage,
    loadOfferData,
    loadLatestQuestionnaireOffer,
    publishOffer,
    resetOffer,
  };
};
