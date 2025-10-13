import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import CreateBusinessProfile from "@/components/CreateBusinessProfile";
import BusinessProfileForm from "@/components/BusinessProfileForm";
import BusinessProfileReview from "@/components/BusinessProfileReview";
import AnalysisSpinner from "@/components/AnalysisSpinner";
import AnalysisErrorFallback from "@/components/business/AnalysisErrorFallback";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep = 'create-profile' | 'manual-form' | 'profile-review' | 'website-analysis' | 'analysis-error';

const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, refetch } = useBusinessProfile();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('create-profile');
  const [isInitializing, setIsInitializing] = useState(true);
  const [analysisError, setAnalysisError] = useState<string>("");

  useEffect(() => {
    const initializeOnboarding = async () => {
      if (profileLoading) return;

      // If onboarding is already completed, redirect to dashboard
      if (profile?.onboarding_completed && profile?.current_onboarding_step === 'completed') {
        console.log('[BusinessOnboarding] Onboarding already completed, redirecting to dashboard');
        navigate('/business/dashboard', { replace: true });
        return;
      }

      // Check for zombie profile (completed but missing required fields)
      if (profile?.onboarding_completed && 
          (!profile.business_name || !profile.industry || !profile.city || !profile.state)) {
        console.warn('[BusinessOnboarding] Detected zombie profile (incomplete but marked complete), resetting...');
        
        await supabase
          .from('business_profiles')
          .update({
            onboarding_completed: false,
            current_onboarding_step: 'business_profile',
            analysis_status: 'failed',
            analysis_error: 'Profile was incomplete, requires re-onboarding'
          })
          .eq('id', profile.id);
        
        toast({
          title: "Profile Reset Required",
          description: "Your previous profile was incomplete. Let's complete your setup.",
          variant: "destructive",
        });
        
        await refetch();
        setCurrentStep('create-profile');
        setIsInitializing(false);
        return;
      }

      // Resume from where user left off
      if (profile) {
        console.log('[BusinessOnboarding] Resuming onboarding:', {
          step: profile.current_onboarding_step,
          analysis_status: (profile as any).analysis_status,
        });
        
        const hasProfileData = profile.business_name && profile.industry && profile.city && profile.state;
        const analysisStatus = (profile as any).analysis_status;
        const analysisStartedAt = (profile as any).analysis_started_at;
        
        // Check for stale pending analysis (>2 minutes old)
        if (analysisStatus === 'pending' && analysisStartedAt) {
          const startedTime = new Date(analysisStartedAt).getTime();
          const now = Date.now();
          const twoMinutes = 2 * 60 * 1000;
          
          if (now - startedTime > twoMinutes) {
            console.warn('[BusinessOnboarding] Stale analysis detected, marking as timeout');
            await supabase
              .from('business_profiles')
              .update({ analysis_status: 'timeout' })
              .eq('id', profile.id);
            
            toast({
              title: "Previous Analysis Timeout",
              description: "Your previous analysis didn't complete. Let's try again or fill manually.",
            });
            
            setAnalysisError("Previous analysis timed out");
            setCurrentStep('analysis-error');
            setIsInitializing(false);
            return;
          }
        }
        
        // Handle different analysis states
        if (analysisStatus === 'failed' || analysisStatus === 'timeout') {
          setAnalysisError((profile as any).analysis_error || 'Analysis failed');
          setCurrentStep('analysis-error');
        } else if (hasProfileData) {
          setCurrentStep('profile-review');
        } else if (profile.seed_url && analysisStatus === 'pending') {
          setCurrentStep('website-analysis');
        } else {
          setCurrentStep('create-profile');
        }
      }

      setIsInitializing(false);
    };

    initializeOnboarding();
  }, [profile, profileLoading, navigate, refetch, toast]);

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
          
          // Check analysis status changes
          if (updatedProfile.analysis_status === 'completed' && 
              updatedProfile.business_name && updatedProfile.industry) {
            toast({
              title: "Website Analyzed Successfully!",
              description: "Please review your profile information.",
            });
            refetch();
            setCurrentStep('profile-review');
          } else if (updatedProfile.analysis_status === 'failed' || 
                     updatedProfile.analysis_status === 'timeout') {
            setAnalysisError(updatedProfile.analysis_error || 'Analysis failed');
            setCurrentStep('analysis-error');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentStep, profile?.id, refetch, toast]);

  const handleWebsiteComplete = () => {
    setCurrentStep('website-analysis');
  };

  const handleAnalysisTimeout = async () => {
    if (!profile?.id) return;
    
    await supabase
      .from('business_profiles')
      .update({ analysis_status: 'timeout' })
      .eq('id', profile.id);
    
    toast({
      title: "Analysis Timeout",
      description: "The website analysis is taking longer than expected. Let's fill in your details manually.",
      variant: "destructive",
    });
    
    setCurrentStep('manual-form');
  };

  const handleAnalysisError = async (error: string) => {
    if (!profile?.id) return;
    
    await supabase
      .from('business_profiles')
      .update({ 
        analysis_status: 'failed',
        analysis_error: error 
      })
      .eq('id', profile.id);
    
    setAnalysisError(error);
    setCurrentStep('analysis-error');
  };

  const handleRetryAnalysis = async () => {
    if (!profile?.id || !profile.seed_url) return;
    
    await supabase
      .from('business_profiles')
      .update({ 
        analysis_status: 'pending',
        analysis_started_at: new Date().toISOString(),
        analysis_error: null
      })
      .eq('id', profile.id);
    
    toast({
      title: "Retrying Analysis",
      description: "Analyzing your website again...",
    });
    
    setCurrentStep('website-analysis');
  };

  const handleManualEntry = () => {
    setCurrentStep('manual-form');
  };

  const handleTryDifferentWebsite = async () => {
    if (!profile?.id) return;
    
    await supabase
      .from('business_profiles')
      .update({ 
        seed_url: null,
        domain: null,
        analysis_status: null,
        analysis_started_at: null,
        analysis_error: null
      })
      .eq('id', profile.id);
    
    setCurrentStep('create-profile');
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
    await supabase.auth.refreshSession();
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
          <AnalysisSpinner 
            type="website" 
            profileId={profile?.id}
            onTimeout={handleAnalysisTimeout}
            onError={handleAnalysisError}
            timeoutMs={60000}
          />
        )}

        {currentStep === 'analysis-error' && profile?.seed_url && (
          <AnalysisErrorFallback
            error={analysisError}
            websiteUrl={profile.seed_url}
            onRetry={handleRetryAnalysis}
            onManualEntry={handleManualEntry}
            onTryDifferentWebsite={handleTryDifferentWebsite}
          />
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
