import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { ProfileCreationStep } from "./onboarding/ProfileCreationStep";
import { SocialsStep } from "./onboarding/SocialsStep";
import LoadingState from "@/components/LoadingState";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep = 'profile-creation' | 'socials';

const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, updateProfile } = useBusinessProfile();
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
          // Has complete profile data -> go to socials
          setCurrentStep('socials');
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
          <SocialsStep />
        )}
      </div>
    </div>
  );
};

export default BusinessOnboarding;
