import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGeocoding } from '@/hooks/useGeocoding';

interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  industry: string;
  city: string;
  state: string;
  zip_code?: string;
  location_lat?: number;
  location_lon?: number;
  website?: string;
  seed_url?: string;
  domain?: string;
  company_bio?: string;
  main_values?: string[] | any;
  number_of_employees?: string;
  markets_served?: string;
  instagram_link?: string;
  facebook_link?: string;
  linkedin_link?: string;
  youtube_link?: string;
  twitter_link?: string;
  sources?: any;
  onboarding_completed: boolean;
  current_onboarding_step: string;
  created_at: string;
  updated_at: string;
}

export const useBusinessProfile = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { geocodeLocation } = useGeocoding();

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching business profile:', error);
      toast({
        title: 'Error loading profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Partial<BusinessProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const insertData: any = {
        user_id: user.id,
        business_name: profileData.business_name || '',
        industry: profileData.industry || '',
        city: profileData.city || '',
        state: profileData.state || '',
        ...profileData,
      };

      const { data, error } = await supabase
        .from('business_profiles')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      setProfile(data);

      // ✅ Geocode location if zip_code provided but coordinates missing
      if (data && !(data as any).location_lat && (profileData.zip_code || profileData.city)) {
        console.log('🗺️ Geocoding business location...');
        const coords = await geocodeLocation(
          profileData.city || '',
          profileData.state || '',
          profileData.zip_code
        );

        if (coords) {
          // Update profile with coordinates
          const { data: updatedData } = await supabase
            .from('business_profiles')
            .update({
              location_lat: coords.latitude,
              location_lon: coords.longitude,
            })
            .eq('id', data.id)
            .select()
            .single();

          if (updatedData) {
            setProfile(updatedData);
          }
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating business profile:', error);
      toast({
        title: 'Error creating profile',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateProfile = async (updates: Partial<BusinessProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('business_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);

      // ✅ Geocode if location fields updated but coordinates still missing
      if (data && !(data as any).location_lat && (updates.zip_code || updates.city || updates.state)) {
        console.log('🗺️ Geocoding updated location...');
        const coords = await geocodeLocation(
          data.city || '',
          data.state || '',
          (data as any).zip_code
        );

        if (coords) {
          const { data: updatedData } = await supabase
            .from('business_profiles')
            .update({
              location_lat: coords.latitude,
              location_lon: coords.longitude,
            })
            .eq('id', data.id)
            .select()
            .single();

          if (updatedData) {
            setProfile(updatedData);
          }
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating business profile:', error);
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const completeOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('business_profiles')
        .update({
          onboarding_completed: true,
          current_onboarding_step: 'completed',
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Verify the update persisted
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: verifyData } = await supabase
        .from('business_profiles')
        .select('onboarding_completed, current_onboarding_step')
        .eq('user_id', user.id)
        .single();

      console.log('[useBusinessProfile] Onboarding completion verification:', verifyData);

      if (!verifyData?.onboarding_completed || verifyData?.current_onboarding_step !== 'completed') {
        throw new Error('Onboarding completion verification failed');
      }

      setProfile(data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error completing onboarding',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    completeOnboarding,
    refetch: fetchProfile,
  };
};
