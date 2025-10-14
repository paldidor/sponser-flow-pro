import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { ProfileCreationStep } from "./onboarding/ProfileCreationStep";
import { SocialsStep } from "./onboarding/SocialsStep";
import BusinessProfileReview from "@/components/BusinessProfileReview";
import LoadingState from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep = 'profile-creation' | 'socials' | 'review';

const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, updateProfile, completeOnboarding } = useBusinessProfile();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile-creation');

  useEffect(() => {
    const initializeOnboarding = async () => {
      if (profileLoading) return;

      // If onboarding is already completed, redirect to dashboard
      if (profile?.onboarding_completed) {
        console.log('[BusinessOnboarding] Onboarding already completed, redirecting to dashboard');
        navigate('/business/dashboard', { replace: true });
        return;
      }

      // Simplified zombie profile recovery: Check if onboarding completed but missing required fields
      if (profile?.onboarding_completed && 
          (!profile.business_name || !profile.industry || !profile.city || !profile.state)) {
        console.warn('[BusinessOnboarding] Zombie profile detected (incomplete but marked complete), resetting...');
        
        await updateProfile({ 
          onboarding_completed: false, 
          current_onboarding_step: 'business_profile' 
        });
        
        toast({
          title: "Profile Setup Required",
          description: "Your previous profile was incomplete. Let's complete your setup.",
          variant: "destructive",
        });
        
        setCurrentStep('profile-creation');
        return;
      }

      // Resume logic based on data completeness
      if (profile) {
        const hasProfileData = profile.business_name && profile.industry && 
                               profile.city && profile.state && profile.domain;
        
        if (hasProfileData) {
          // Has complete profile data -> go to socials or review
          const hasSocials = profile.instagram_link || profile.facebook_link || 
                            profile.twitter_link || profile.linkedin_link;
          setCurrentStep(hasSocials ? 'review' : 'socials');
        } else {
          // Missing profile data -> start from beginning
          setCurrentStep('profile-creation');
        }
      }
    };

    initializeOnboarding();
  }, [profile, profileLoading, navigate, updateProfile, toast]);

  const handleProfileComplete = () => {
    console.log('[BusinessOnboarding] Profile creation complete, advancing to socials');
    setCurrentStep('socials');
  };

  const handleSocialsComplete = () => {
    console.log('[BusinessOnboarding] Socials complete, advancing to review');
    setCurrentStep('review');
  };

  const handleSkipSocials = () => {
    console.log('[BusinessOnboarding] Socials skipped, advancing to review');
    setCurrentStep('review');
  };

  const handleEdit = () => {
    console.log('[BusinessOnboarding] Editing profile, returning to profile creation');
    setCurrentStep('profile-creation');
  };

  const handleReviewComplete = async () => {
    console.log('[BusinessOnboarding] Review complete, finalizing onboarding');
    
    const { error } = await completeOnboarding();
    
    if (!error) {
      // Refresh session and navigate to dashboard
      await supabase.auth.refreshSession();
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/business/dashboard', { replace: true });
    }
  };

  if (profileLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {currentStep === 'profile-creation' && (
          <ProfileCreationStep onComplete={handleProfileComplete} />
        )}

        {currentStep === 'socials' && (
          <SocialsStep 
            onComplete={handleSocialsComplete}
            onSkip={handleSkipSocials}
          />
        )}

        {currentStep === 'review' && (
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
