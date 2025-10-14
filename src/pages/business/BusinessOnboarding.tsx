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

      if (!profile) {
        setCurrentStep('profile-creation');
        return;
      }

      const incomplete = !profile.business_name || !profile.industry || 
                         !profile.city || !profile.state;

      if (profile.onboarding_completed && incomplete) {
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

      if (profile.onboarding_completed && !incomplete) {
        console.log('[BusinessOnboarding] Onboarding complete, redirecting to dashboard');
        navigate('/business/dashboard', { replace: true });
        return;
      }

      setCurrentStep(incomplete ? 'profile-creation' : 'socials');
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
