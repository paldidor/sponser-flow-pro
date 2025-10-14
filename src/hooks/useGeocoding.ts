import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGeocoding = () => {
  const { toast } = useToast();

  const geocodeLocation = async (city: string, state: string, zipCode?: string) => {
    try {
      console.log('🗺️ Geocoding:', { city, state, zipCode });
      
      const { data, error } = await supabase.functions.invoke('geocode-location', {
        body: { city, state, zipCode },
      });

      if (error) throw error;

      if (!data.latitude || !data.longitude) {
        throw new Error('Invalid geocoding response');
      }

      console.log('✅ Geocoded successfully:', data);
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        formatted_address: data.formatted_address,
      };
    } catch (error: any) {
      console.error('Geocoding error:', error);
      // Non-blocking warning - geocoding failure shouldn't prevent onboarding
      toast({
        title: 'Location geocoding pending',
        description: 'Location coordinates will be added later. This won\'t affect your profile.',
      });
      return null;
    }
  };

  return { geocodeLocation };
};
