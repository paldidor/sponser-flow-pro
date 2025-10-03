import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'team' | 'business' | 'admin' | null;

interface SmartAuthState {
  loading: boolean;
  user: any | null;
  userRole: UserRole;
  hasTeamProfile: boolean;
  onboardingCompleted: boolean;
  currentOnboardingStep: string | null;
  redirectPath: string;
}

export const useSmartAuth = () => {
  const [state, setState] = useState<SmartAuthState>({
    loading: true,
    user: null,
    userRole: null,
    hasTeamProfile: false,
    onboardingCompleted: false,
    currentOnboardingStep: null,
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
          onboardingCompleted: false,
          currentOnboardingStep: null,
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
      let onboardingCompleted = false;
      let currentStep: string | null = null;
      if (userRole === 'team') {
        const { data: teamProfile, error: profileError } = await supabase
          .from('team_profiles')
          .select('id, onboarding_completed, current_onboarding_step')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking team profile:', profileError);
        }

        hasProfile = !!teamProfile;
        onboardingCompleted = teamProfile?.onboarding_completed ?? false;
        currentStep = teamProfile?.current_onboarding_step ?? null;
      }

      // Determine redirect path based on role, profile status, and onboarding completion
      let redirectPath = '/auth';
      
      if (userRole === 'team') {
        // Only redirect to dashboard if onboarding is completed AND step is 'completed'
        redirectPath = (hasProfile && onboardingCompleted && currentStep === 'completed') 
          ? '/team/dashboard' 
          : '/team/onboarding';
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
        onboardingCompleted,
        currentOnboardingStep: currentStep,
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
            onboardingCompleted: false,
            currentOnboardingStep: null,
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
