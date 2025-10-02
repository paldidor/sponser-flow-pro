import { Navigate, useLocation } from "react-router-dom";
import { useSmartAuth } from "@/hooks/useSmartAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresProfile?: boolean;
}

const ProtectedRoute = ({ children, requiresProfile = false }: ProtectedRouteProps) => {
  const { loading, user, userRole, hasTeamProfile } = useSmartAuth();
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

  // For dashboard route, check if profile exists (team users only)
  if (requiresProfile && userRole === 'team' && !hasTeamProfile && location.pathname === '/team/dashboard') {
    return <Navigate to="/team/onboarding" replace />;
  }

  // For onboarding route, redirect to dashboard if profile already exists
  if (userRole === 'team' && hasTeamProfile && location.pathname === '/team/onboarding') {
    return <Navigate to="/team/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
