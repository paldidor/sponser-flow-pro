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
  hasBusinessProfile: boolean;
  businessOnboardingCompleted: boolean;
  businessOnboardingStep: string | null;
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
    hasBusinessProfile: false,
    businessOnboardingCompleted: false,
    businessOnboardingStep: null,
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
          hasBusinessProfile: false,
          businessOnboardingCompleted: false,
          businessOnboardingStep: null,
          redirectPath: '/auth',
        });
        return;
      }

      // Check for pending user type (from Google OAuth) and assign role
      const pendingUserType = localStorage.getItem('pending_user_type');
      if (pendingUserType) {
        try {
          // Check if user already has a role
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          // Only assign role if user doesn't have one yet
          if (!existingRole) {
            await supabase
              .from('user_roles')
              .insert({
                user_id: session.user.id,
                role: pendingUserType as 'team' | 'business',
              });
            
            console.log(`[useSmartAuth] Assigned pending role: ${pendingUserType}`);
          }
        } catch (error) {
          console.error('[useSmartAuth] Failed to assign pending role:', error);
        } finally {
          // Clear pending user type
          localStorage.removeItem('pending_user_type');
        }
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

      // Don't default to 'team' - wait for role to be assigned
      const userRole = (roleData?.role as UserRole) || null;

      // Check if user has a team profile (only for team users)
      let hasProfile = false;
      let onboardingCompleted = false;
      let currentStep: string | null = null;
      
      // Check if user has a business profile (only for business users)
      let hasBusinessProfile = false;
      let businessOnboardingCompleted = false;
      let businessCurrentStep: string | null = null;

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
        
        console.log('[useSmartAuth] Team profile status:', {
          hasProfile,
          onboardingCompleted,
          currentStep,
        });
      } else if (userRole === 'business') {
        const { data: businessProfile, error: profileError } = await supabase
          .from('business_profiles')
          .select('id, onboarding_completed, current_onboarding_step')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking business profile:', profileError);
        }

        hasBusinessProfile = !!businessProfile;
        businessOnboardingCompleted = businessProfile?.onboarding_completed ?? false;
        businessCurrentStep = businessProfile?.current_onboarding_step ?? null;
        
        console.log('[useSmartAuth] Business profile status:', {
          hasBusinessProfile,
          businessOnboardingCompleted,
          businessCurrentStep,
        });
      }

      // Determine redirect path based on role, profile status, and onboarding completion
      let redirectPath = '/auth';
      
      if (userRole === 'team') {
        // Only redirect to dashboard if onboarding is completed AND step is 'completed'
        const canAccessDashboard = hasProfile && onboardingCompleted && currentStep === 'completed';
        redirectPath = canAccessDashboard ? '/team/dashboard' : '/team/onboarding';
        
        console.log('[useSmartAuth] Team redirect decision:', {
          canAccessDashboard,
          redirectPath,
        });
      } else if (userRole === 'business') {
        // Only redirect to dashboard if onboarding is completed AND step is 'completed'
        const canAccessDashboard = hasBusinessProfile && businessOnboardingCompleted && businessCurrentStep === 'completed';
        redirectPath = canAccessDashboard ? '/business/dashboard' : '/business/onboarding';
        
        console.log('[useSmartAuth] Business redirect decision:', {
          canAccessDashboard,
          redirectPath,
        });
      } else if (userRole === 'admin') {
        redirectPath = '/team/dashboard'; // Future: /admin/dashboard
      } else if (!userRole) {
        // No role assigned yet - stay on auth/select user type
        redirectPath = '/select-user-type';
        console.log('[useSmartAuth] No role found, redirecting to user type selection');
      }

      setState({
        loading: false,
        user: session.user,
        userRole,
        hasTeamProfile: hasProfile,
        onboardingCompleted,
        currentOnboardingStep: currentStep,
        hasBusinessProfile,
        businessOnboardingCompleted,
        businessOnboardingStep: businessCurrentStep,
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
            hasBusinessProfile: false,
            businessOnboardingCompleted: false,
            businessOnboardingStep: null,
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
