import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import CreateBusinessProfile from "@/components/CreateBusinessProfile";
import BusinessProfileForm from "@/components/BusinessProfileForm";
import BusinessProfileReview from "@/components/BusinessProfileReview";
import AnalysisSpinner from "@/components/AnalysisSpinner";
import { supabase } from "@/integrations/supabase/client";

type OnboardingStep = 'create-profile' | 'manual-form' | 'profile-review' | 'website-analysis';

const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, refetch } = useBusinessProfile();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('create-profile');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeOnboarding = async () => {
      if (profileLoading) return;

      // If onboarding is already completed, redirect to dashboard
      if (profile?.onboarding_completed && profile?.current_onboarding_step === 'completed') {
        console.log('[BusinessOnboarding] Onboarding already completed, redirecting to dashboard');
        navigate('/business/dashboard', { replace: true });
        return;
      }

      // Resume from where user left off
      if (profile) {
        console.log('[BusinessOnboarding] Resuming onboarding:', profile.current_onboarding_step);
        
        // Check if profile has data (either from website analysis or manual entry)
        const hasProfileData = profile.business_name && profile.industry && profile.city && profile.state;
        
        if (hasProfileData) {
          setCurrentStep('profile-review');
        } else if (profile.seed_url) {
          // Website was submitted, show analysis
          setCurrentStep('website-analysis');
        } else {
          // Start from beginning
          setCurrentStep('create-profile');
        }
      }

      setIsInitializing(false);
    };

    initializeOnboarding();
  }, [profile, profileLoading, navigate]);

  // Subscribe to realtime updates for website analysis
  useEffect(() => {
    if (currentStep !== 'website-analysis' || !profile?.id) return;

    const channel = supabase
      .channel('business-profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'business_profiles',
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          console.log('[BusinessOnboarding] Profile updated:', payload);
          const updatedProfile = payload.new as any;
          
          // Check if analysis populated the data
          if (updatedProfile.business_name && updatedProfile.industry) {
            refetch();
            setCurrentStep('profile-review');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentStep, profile?.id, refetch]);

  const handleWebsiteComplete = () => {
    setCurrentStep('website-analysis');
  };

  const handleManualEntry = () => {
    setCurrentStep('manual-form');
  };

  const handleFormComplete = () => {
    refetch();
    setCurrentStep('profile-review');
  };

  const handleEdit = () => {
    if (profile?.seed_url) {
      setCurrentStep('website-analysis');
    } else {
      setCurrentStep('manual-form');
    }
  };

  const handleReviewComplete = async () => {
    // Refresh auth session to pick up updated profile
    await supabase.auth.refreshSession();
    
    // Small delay to ensure state propagates
    await new Promise(resolve => setTimeout(resolve, 500));
    
    navigate('/business/dashboard', { replace: true });
  };

  if (isInitializing || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {currentStep === 'create-profile' && (
          <CreateBusinessProfile
            onComplete={handleWebsiteComplete}
            onManualEntry={handleManualEntry}
          />
        )}

        {currentStep === 'website-analysis' && (
          <AnalysisSpinner type="website" />
        )}

        {currentStep === 'manual-form' && (
          <BusinessProfileForm onComplete={handleFormComplete} />
        )}

        {currentStep === 'profile-review' && (
          <BusinessProfileReview
            onEdit={handleEdit}
            onComplete={handleReviewComplete}
          />
        )}
      </div>
    </div>
  );
};

export default BusinessOnboarding;
