import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  OnboardingStep, 
  STEP_TO_DB_ENUM, 
  isOnboardingFullyCompleted,
  getResumeStep 
} from "@/lib/onboardingHelpers";
import type { TeamProfile } from "@/types/flow";

/**
 * Custom hook for managing onboarding state and step transitions
 */
export const useOnboardingState = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('create-profile');
  const [teamData, setTeamData] = useState<TeamProfile | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update DB step when currentStep changes (source of truth for tab switches)
  useEffect(() => {
    const updateDBStep = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const dbStep = STEP_TO_DB_ENUM[currentStep];
        console.log('[useOnboardingState] Updating DB step:', currentStep, '→', dbStep);

        await supabase
          .from('team_profiles')
          .update({ current_onboarding_step: dbStep })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating onboarding step:', error);
      }
    };

    // Only update if we're past initialization
    if (!isInitializing && currentStep !== 'create-profile') {
      updateDBStep();
    }
  }, [currentStep, isInitializing]);

  // Check if user already has a profile on mount
  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        setIsInitializing(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          toast({
            title: "Authentication Error",
            description: "Please log in to continue.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access the onboarding flow.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('team_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking team profile:', profileError);
          toast({
            title: "Error Loading Profile",
            description: "We couldn't check your profile status. Starting fresh.",
          });
          return;
        }

        if (profile) {
          setTeamData(profile as TeamProfile);
          
          // CRITICAL: Only redirect to dashboard if FULLY completed
          if (isOnboardingFullyCompleted(profile)) {
            console.log('[useOnboardingState] Onboarding fully complete, redirecting to dashboard');
            navigate('/team/dashboard', { replace: true });
            return;
          }
          
          // Resume from last step if onboarding in progress
          const dbStep = profile.current_onboarding_step || 'account_created';
          const resumeStep = getResumeStep(dbStep);
          console.log('[useOnboardingState] Resuming from step:', dbStep, '→', resumeStep);
          setCurrentStep(resumeStep);
        }
      } catch (error) {
        console.error('Unexpected error during initialization:', error);
        toast({
          title: "Something Went Wrong",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    checkExistingProfile();
  }, [navigate, toast]);

  /**
   * Verify team profile exists before proceeding
   */
  const verifyTeamProfile = async (): Promise<boolean> => {
    try {
      setIsCheckingProfile(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/auth');
        return false;
      }

      const { data: teamProfile, error } = await supabase
        .from('team_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking team profile:', error);
        toast({
          title: "Verification Failed",
          description: "We couldn't verify your team profile. Please try again or contact support if the issue persists.",
          variant: "destructive",
        });
        return false;
      }

      if (!teamProfile) {
        toast({
          title: "Profile Required",
          description: "You need to complete your team profile first. Let's go back and create it!",
          variant: "destructive",
        });
        setCurrentStep('create-profile');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error during profile verification:', error);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCheckingProfile(false);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    teamData,
    setTeamData,
    isManualEntry,
    setIsManualEntry,
    isInitializing,
    isCheckingProfile,
    verifyTeamProfile,
  };
};
