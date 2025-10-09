import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateTeamProfile } from "@/lib/validationUtils";
import type { TeamProfile } from "@/types/flow";

/**
 * Custom hook for handling team profile submission and approval
 */
export const useProfileSubmission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Handle profile approval and complete onboarding
   */
  const handleProfileApprove = async (teamData: TeamProfile | null): Promise<boolean> => {
    if (!teamData) {
      toast({
        title: "Profile Required",
        description: "Please complete your team profile first.",
        variant: "destructive",
      });
      return false;
    }

    const validation = validateTeamProfile(teamData);
    if (!validation.isValid) {
      toast({
        title: "Incomplete Profile",
        description: validation.errors[0],
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        navigate('/auth');
        return false;
      }

      console.log('[useProfileSubmission] Starting update for user:', user.id);

      const { error: updateError } = await supabase
        .from('team_profiles')
        .update({ 
          onboarding_completed: true,
          current_onboarding_step: 'completed'
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('[useProfileSubmission] Update error:', updateError);
        toast({
          title: "Error",
          description: "Failed to complete profile. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // CRITICAL: Verify the update persisted before navigating
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('team_profiles')
        .select('onboarding_completed, current_onboarding_step')
        .eq('user_id', user.id)
        .single();

      if (verifyError || !verifyProfile) {
        console.error('[useProfileSubmission] Verification failed:', verifyError);
        toast({
          title: "Verification Failed",
          description: "Please try again. If the problem persists, contact support.",
          variant: "destructive",
        });
        return false;
      }

      console.log('[useProfileSubmission] Verification result:', verifyProfile);

      if (!verifyProfile.onboarding_completed || verifyProfile.current_onboarding_step !== 'completed') {
        console.error('[useProfileSubmission] Database update did not persist correctly', verifyProfile);
        toast({
          title: "Update Failed",
          description: "Profile update did not save. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      console.log('[useProfileSubmission] Profile approved and verified, onboarding completed');
      
      toast({
        title: "Profile Approved!",
        description: "Taking you to your dashboard...",
      });
      
      // Force auth state refresh before navigation to ensure ProtectedRoute sees updated data
      await supabase.auth.refreshSession();
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/team/dashboard', { replace: true });
      }, 800);

      return true;
    } catch (error) {
      console.error('[useProfileSubmission] Unexpected error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Complete onboarding after offer is published
   */
  const completeOnboarding = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error: updateError } = await supabase
        .from('team_profiles')
        .update({ 
          onboarding_completed: true,
          current_onboarding_step: 'completed'
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error marking onboarding complete:', updateError);
        toast({
          title: "Warning",
          description: "Offer published but onboarding status couldn't be updated.",
          variant: "destructive",
        });
        return false;
      }

      console.log('[useProfileSubmission] Onboarding completed successfully');
      
      toast({
        title: "Welcome to Sponsa!",
        description: "Your sponsorship offer is now live. Redirecting to dashboard...",
      });
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/team/dashboard', { replace: true });
      }, 1000);

      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    handleProfileApprove,
    completeOnboarding,
  };
};
