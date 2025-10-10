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
      toast({
        title: 'Geocoding failed',
        description: 'Could not find location coordinates. AI recommendations may be limited.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return { geocodeLocation };
};
