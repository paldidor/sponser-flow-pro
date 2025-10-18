import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching business profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const geocodeLocation = async (city: string, state: string, zipCode: string) => {
    try {
      console.log('🗺️ Geocoding location:', { city, state, zipCode });
      
      const { data, error } = await supabase.functions.invoke('geocode-location', {
        body: { city, state, zipCode },
      });

      if (error) {
        console.error('Geocoding error:', error);
        return null;
      }

      if (!data?.latitude || !data?.longitude) {
        console.warn('Invalid geocoding response');
        return null;
      }

      console.log('✅ Geocoded successfully:', data);
      return {
        latitude: data.latitude,
        longitude: data.longitude,
      };
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  };

  const createProfile = async (profileData: Partial<BusinessProfile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating business profile with data:', profileData);

    // Geocode location if provided
    let locationData = {};
    if (profileData.city && profileData.state && profileData.zip_code) {
      const geocoded = await geocodeLocation(
        profileData.city,
        profileData.state,
        profileData.zip_code
      );
      
      if (geocoded) {
        locationData = {
          location_lat: geocoded.latitude,
          location_lon: geocoded.longitude,
        };
      }
    }

    const { data, error } = await supabase
      .from('business_profiles')
      .insert({
        user_id: user.id,
        business_name: profileData.business_name,
        industry: profileData.industry,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zip_code,
        ...locationData,
        current_onboarding_step: 'profile_created',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating business profile:', error);
      throw error;
    }

    console.log('Business profile created:', data);
    setProfile(data);
    return data;
  };

  const updateProfile = async (updates: Partial<BusinessProfile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Updating business profile with data:', updates);

    const { data, error } = await supabase
      .from('business_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating business profile:', error);
      throw error;
    }

    console.log('Business profile updated:', data);
    setProfile(data);
    return data;
  };

  const completeOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('business_profiles')
      .update({
        onboarding_completed: true,
        current_onboarding_step: 'completed',
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }

    console.log('[useBusinessProfile] Onboarding completed:', data);
    setProfile(data);
    return data;
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
