import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProfile(null);
        setLoading(false);
        return null;
      }

      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching business profile:', error);
      toast({
        title: 'Error loading profile',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Partial<BusinessProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      console.log('[useBusinessProfile] Creating/updating profile with data:', profileData);

      const normalize = (v?: string | null): string | null => {
        if (v === undefined || v === null) return null;
        const trimmed = String(v).trim();
        return trimmed.length > 0 ? trimmed : null;
      };

      const payload: any = {
        user_id: user.id,
        business_name: normalize(profileData.business_name),
        industry: normalize(profileData.industry),
        city: normalize(profileData.city),
        state: normalize(profileData.state),
        domain: normalize((profileData as any).domain ?? profileData.website),
        company_bio: normalize(profileData.company_bio),
        markets_served: normalize(profileData.markets_served),
        main_values: profileData.main_values ?? [],
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('business_profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('[useBusinessProfile] Upsert error:', error);
        throw error;
      }

      console.log('[useBusinessProfile] Profile saved successfully:', data);
      setProfile(data);

      return { data, error: null };
    } catch (error: any) {
      console.error('Error saving business profile:', error);
      toast({
        title: 'Error saving profile',
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

      console.log('[useBusinessProfile] Updating profile with data:', updates);

      const normalize = (v?: string | null): string | null => {
        if (v === undefined || v === null) return null;
        const trimmed = String(v).trim();
        return trimmed.length > 0 ? trimmed : null;
      };

      const payload: any = {
        user_id: user.id,
        business_name: normalize(updates.business_name ?? profile?.business_name),
        industry: normalize(updates.industry ?? profile?.industry),
        city: normalize(updates.city ?? profile?.city),
        state: normalize(updates.state ?? profile?.state),
        domain: normalize((updates as any).domain ?? (updates as any).website ?? profile?.domain),
        company_bio: normalize(updates.company_bio ?? profile?.company_bio),
        markets_served: normalize(updates.markets_served ?? profile?.markets_served),
        main_values: updates.main_values ?? profile?.main_values ?? [],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('business_profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('[useBusinessProfile] Upsert error:', error);
        throw error;
      }

      console.log('[useBusinessProfile] Profile updated successfully:', data);
      setProfile(data);

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

      const current = await fetchProfile();
      
      if (!current?.business_name || !current?.industry || 
          !current?.city || !current?.state) {
        throw new Error('Cannot complete onboarding with missing required fields: business_name, industry, city, or state');
      }

      const completePayload = {
        ...current,
        onboarding_completed: true,
        current_onboarding_step: 'completed',
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('business_profiles')
        .upsert(completePayload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      console.log('[useBusinessProfile] Onboarding completion successful:', data);
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
