import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SmartAuthState {
  loading: boolean;
  user: any | null;
  hasTeamProfile: boolean;
  redirectPath: string;
}

export const useSmartAuth = () => {
  const [state, setState] = useState<SmartAuthState>({
    loading: true,
    user: null,
    hasTeamProfile: false,
    redirectPath: '/team/onboarding',
  });

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setState({
          loading: false,
          user: null,
          hasTeamProfile: false,
          redirectPath: '/auth',
        });
        return;
      }

      // Check if user has a team profile
      const { data: teamProfile } = await supabase
        .from('team_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      const hasProfile = !!teamProfile;

      setState({
        loading: false,
        user: session.user,
        hasTeamProfile: hasProfile,
        redirectPath: hasProfile ? '/team/dashboard' : '/team/onboarding',
      });
    };

    checkAuthAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setState({
            loading: false,
            user: null,
            hasTeamProfile: false,
            redirectPath: '/auth',
          });
        } else {
          // Re-check profile status on auth change
          checkAuthAndProfile();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return state;
};
