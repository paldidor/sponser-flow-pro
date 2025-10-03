import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSmartAuth } from './useSmartAuth';

/**
 * Onboarding Guard Hook
 * 
 * Centralizes all onboarding redirect logic to prevent tab-switch issues.
 * 
 * Key behaviors:
 * - Blocks dashboard access until onboarding is fully completed
 * - Keeps users in onboarding until current_onboarding_step === 'completed'
 * - Source of truth: database (team_profiles.current_onboarding_step)
 * - Survives tab switches and session refreshes
 */
export function useOnboardingGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    loading, 
    userRole, 
    hasTeamProfile, 
    onboardingCompleted, 
    currentOnboardingStep 
  } = useSmartAuth();

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // Only apply guard to team users
    if (userRole !== 'team') return;

    const pathname = location.pathname;
    const isDashboardRoute = pathname.startsWith('/team/dashboard');
    const isOnboardingRoute = pathname.startsWith('/team/onboarding');

    // CRITICAL: Block dashboard access unless fully completed
    // Must have: profile exists + onboarding_completed = true + step = 'completed'
    if (isDashboardRoute) {
      const canAccessDashboard = 
        hasTeamProfile && 
        onboardingCompleted && 
        currentOnboardingStep === 'completed';

      if (!canAccessDashboard) {
        console.log('[OnboardingGuard] Blocking dashboard access', {
          hasTeamProfile,
          onboardingCompleted,
          currentOnboardingStep,
        });
        navigate('/team/onboarding', { replace: true });
        return;
      }
    }

    // Keep users in onboarding if not completed
    // This prevents premature exits via URL manipulation
    if (isOnboardingRoute && onboardingCompleted && currentOnboardingStep === 'completed') {
      console.log('[OnboardingGuard] Onboarding complete, allowing dashboard access');
      navigate('/team/dashboard', { replace: true });
      return;
    }

  }, [
    loading, 
    userRole, 
    hasTeamProfile, 
    onboardingCompleted, 
    currentOnboardingStep, 
    location.pathname, 
    navigate
  ]);
}
