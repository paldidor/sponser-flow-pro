import { Navigate, useLocation } from "react-router-dom";
import { useSmartAuth } from "@/hooks/useSmartAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresProfile?: boolean;
}

const ProtectedRoute = ({ children, requiresProfile = false }: ProtectedRouteProps) => {
  const { loading, user, userRole, hasTeamProfile, onboardingCompleted, currentOnboardingStep } = useSmartAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Role-based access control for team routes
  const isTeamRoute = location.pathname.startsWith('/team');
  if (isTeamRoute && userRole !== 'team') {
    return <Navigate to="/marketplace" replace />;
  }

  // CRITICAL: Dashboard requires profile + onboarding_completed + step === 'completed'
  // This prevents tab-switch issues by using DB step as source of truth
  if (requiresProfile && userRole === 'team' && location.pathname === '/team/dashboard') {
    const canAccessDashboard = hasTeamProfile && onboardingCompleted && currentOnboardingStep === 'completed';
    
    if (!canAccessDashboard) {
      console.log('[ProtectedRoute] Blocking dashboard, redirecting to onboarding', {
        hasTeamProfile,
        onboardingCompleted,
        currentOnboardingStep,
      });
      return <Navigate to="/team/onboarding" replace />;
    }
  }

  // For onboarding route, redirect to dashboard ONLY if step === 'completed'
  // This ensures users can't be redirected out of onboarding prematurely
  if (userRole === 'team' && location.pathname === '/team/onboarding') {
    const isFullyComplete = hasTeamProfile && onboardingCompleted && currentOnboardingStep === 'completed';
    
    if (isFullyComplete) {
      console.log('[ProtectedRoute] Onboarding fully complete, allowing dashboard access');
      return <Navigate to="/team/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
