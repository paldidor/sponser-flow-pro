import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AuthFlow from "@/components/AuthFlow";
import { useSmartAuth } from "@/hooks/useSmartAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { loading, user, redirectPath } = useSmartAuth();

  useEffect(() => {
    // Redirect authenticated users to appropriate destination
    if (!loading && user) {
      navigate(redirectPath);
    }
  }, [loading, user, redirectPath, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <AuthFlow 
        onAuthComplete={() => navigate(redirectPath)} 
        onBack={() => navigate('/')}
      />
    </div>
  );
};

export default Auth;
