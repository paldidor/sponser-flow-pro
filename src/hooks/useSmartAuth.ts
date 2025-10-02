import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'team' | 'business' | 'admin' | null;

interface SmartAuthState {
  loading: boolean;
  user: any | null;
  userRole: UserRole;
  hasTeamProfile: boolean;
  redirectPath: string;
}

export const useSmartAuth = () => {
  const [state, setState] = useState<SmartAuthState>({
    loading: true,
    user: null,
    userRole: null,
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
          userRole: null,
          hasTeamProfile: false,
          redirectPath: '/auth',
        });
        return;
      }

      // Fetch user role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
      }

      const userRole = (roleData?.role as UserRole) || 'team'; // Default to team

      // Check if user has a team profile (only for team users)
      let hasProfile = false;
      if (userRole === 'team') {
        const { data: teamProfile, error: profileError } = await supabase
          .from('team_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking team profile:', profileError);
        }

        hasProfile = !!teamProfile;
      }

      // Check if onboarding is in progress - if so, don't redirect
      const isOnboarding = sessionStorage.getItem('onboarding_in_progress') === 'true';
      
      // Determine redirect path based on role and profile status
      let redirectPath = '/auth';
      
      if (isOnboarding) {
        // Stay on current page during onboarding
        redirectPath = window.location.pathname;
      } else if (userRole === 'team') {
        redirectPath = hasProfile ? '/team/dashboard' : '/team/onboarding';
      } else if (userRole === 'business') {
        redirectPath = '/marketplace'; // Future: /business/dashboard
      } else if (userRole === 'admin') {
        redirectPath = '/team/dashboard'; // Future: /admin/dashboard
      }

      setState({
        loading: false,
        user: session.user,
        userRole,
        hasTeamProfile: hasProfile,
        redirectPath,
      });
    };

    checkAuthAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setState({
            loading: false,
            user: null,
            userRole: null,
            hasTeamProfile: false,
            redirectPath: '/auth',
          });
        } else {
          // Re-check role and profile status on auth change
          checkAuthAndProfile();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return state;
};
