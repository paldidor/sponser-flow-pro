import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import BusinessInfoForm, { BusinessFormData } from "@/components/BusinessInfoForm";
import { supabase } from "@/integrations/supabase/client";

const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, createProfile, completeOnboarding } = useBusinessProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (profileLoading) return;

      // If onboarding is already completed, redirect to dashboard
      if (profile?.onboarding_completed) {
        console.log('[BusinessOnboarding] Onboarding already completed, redirecting to dashboard');
        navigate('/business/dashboard', { replace: true });
      }
    };

    checkOnboarding();
  }, [profile, profileLoading, navigate]);

  const handleSubmit = async (formData: BusinessFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('[BusinessOnboarding] Submitting profile:', formData);
      
      // Create profile with core fields
      await createProfile(formData);
      
      // Mark onboarding as complete
      await completeOnboarding();
      
      // Refresh auth session to pick up updated profile
      await supabase.auth.refreshSession();
      
      // Small delay to ensure state propagates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to dashboard
      navigate('/business/dashboard', { replace: true });
    } catch (error) {
      console.error('[BusinessOnboarding] Error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    // Navigation is handled in handleSubmit after successful completion
    console.log('[BusinessOnboarding] Form completed');
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BusinessInfoForm 
      onComplete={handleComplete}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
};

export default BusinessOnboarding;
