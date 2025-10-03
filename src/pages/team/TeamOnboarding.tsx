import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOfferCreation } from "@/hooks/useOfferCreation";
import { validateTeamProfile, validatePDFFile } from "@/lib/validationUtils";
import LoadingState from "@/components/LoadingState";
import CreateTeamProfile from "@/components/CreateTeamProfile";
import ProfileReview from "@/components/ProfileReview";
import CreateSponsorshipOffer from "@/components/CreateSponsorshipOffer";
import QuestionnaireFlow from "@/components/questionnaire/QuestionnaireFlow";
import SponsorshipReview from "@/components/SponsorshipReview";
import WebsiteAnalysisInput from "@/components/WebsiteAnalysisInput";
import PDFUploadInput from "@/components/PDFUploadInput";
import PDFAnalysisProgress from "@/components/PDFAnalysisProgress";
import type { TeamProfile, MultiStepOfferData } from "@/types/flow";

type OnboardingStep =
  | 'create-profile'
  | 'profile-review'
  | 'select-method'
  | 'website-analysis'
  | 'pdf-upload'
  | 'questionnaire'
  | 'review';

// Map UI steps to DB enum values for step tracking
const STEP_TO_DB_ENUM: Record<OnboardingStep, string> = {
  'create-profile': 'account_created',
  'profile-review': 'team_profile',
  'select-method': 'team_profile',
  'website-analysis': 'website_analyzed',
  'pdf-upload': 'website_analyzed',
  'questionnaire': 'packages',
  'review': 'review',
};

// Map DB enum values back to UI steps for resume logic
const DB_ENUM_TO_STEP: Record<string, OnboardingStep> = {
  'account_created': 'create-profile',
  'team_profile': 'profile-review',
  'website_analyzed': 'select-method',
  'packages': 'questionnaire',
  'review': 'review',
  'completed': 'review', // Should not happen, but safety net
};

const TeamOnboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('create-profile');
  const [teamData, setTeamData] = useState<TeamProfile | null>(null);
  const [analysisFileName, setAnalysisFileName] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOfferId, offerData, isLoading, loadingMessage, loadOfferData, loadLatestQuestionnaireOffer, publishOffer, resetOffer } = useOfferCreation();

  // Update DB step when currentStep changes (source of truth for tab switches)
  useEffect(() => {
    const updateDBStep = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const dbStep = STEP_TO_DB_ENUM[currentStep] as 'account_created' | 'team_profile' | 'website_analyzed' | 'packages' | 'review' | 'completed';
        console.log('[TeamOnboarding] Updating DB step:', currentStep, '→', dbStep);

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

  // Check if user already has a profile
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
          // Stay on 'create-profile' step on error
          return;
        }

        if (profile) {
          setTeamData(profile as TeamProfile);
          
          // CRITICAL: Only redirect to dashboard if FULLY completed
          if (profile.onboarding_completed && profile.current_onboarding_step === 'completed') {
            console.log('[TeamOnboarding] Onboarding fully complete, redirecting to dashboard');
            navigate('/team/dashboard', { replace: true });
            return;
          }
          
          // Resume from last step if onboarding in progress
          const dbStep = profile.current_onboarding_step || 'account_created';
          const resumeStep = DB_ENUM_TO_STEP[dbStep] || 'create-profile';
          console.log('[TeamOnboarding] Resuming from step:', dbStep, '→', resumeStep);
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

  const handleProfileUpdate = (updatedProfile: TeamProfile) => {
    setTeamData(updatedProfile);
  };

  const handleProfileApprove = async () => {
    if (!teamData) {
      toast({
        title: "Profile Required",
        description: "Please complete your team profile first.",
        variant: "destructive",
      });
      return;
    }

    const validation = validateTeamProfile(teamData);
    if (!validation.isValid) {
      toast({
        title: "Incomplete Profile",
        description: validation.errors[0],
        variant: "destructive",
      });
      return;
    }

    // Complete onboarding after profile approval
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      console.log('[handleProfileApprove] Starting update for user:', user.id);

      const { error: updateError } = await supabase
        .from('team_profiles')
        .update({ 
          onboarding_completed: true,
          current_onboarding_step: 'completed'
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('[handleProfileApprove] Update error:', updateError);
        toast({
          title: "Error",
          description: "Failed to complete profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // CRITICAL: Verify the update persisted before navigating
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('team_profiles')
        .select('onboarding_completed, current_onboarding_step')
        .eq('user_id', user.id)
        .single();

      if (verifyError || !verifyProfile) {
        console.error('[handleProfileApprove] Verification failed:', verifyError);
        toast({
          title: "Verification Failed",
          description: "Please try again. If the problem persists, contact support.",
          variant: "destructive",
        });
        return;
      }

      console.log('[handleProfileApprove] Verification result:', verifyProfile);

      if (!verifyProfile.onboarding_completed || verifyProfile.current_onboarding_step !== 'completed') {
        console.error('[handleProfileApprove] Database update did not persist correctly', verifyProfile);
        toast({
          title: "Update Failed",
          description: "Profile update did not save. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('[handleProfileApprove] Profile approved and verified, onboarding completed');
      
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
    } catch (error) {
      console.error('[handleProfileApprove] Unexpected error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectMethod = async (method: "form" | "website" | "pdf", url?: string) => {
    // Validate that team profile exists before allowing offer creation
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
        return;
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
        return;
      }

      if (!teamProfile) {
        toast({
          title: "Profile Required",
          description: "You need to complete your team profile first. Let's go back and create it!",
          variant: "destructive",
        });
        setCurrentStep('create-profile');
        return;
      }

      // Profile exists, proceed with selected method
      if (method === "form") {
        setCurrentStep('questionnaire');
      } else if (method === "website") {
        setCurrentStep('website-analysis');
      } else {
        setCurrentStep('pdf-upload');
      }
    } catch (error) {
      console.error('Unexpected error during method selection:', error);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingProfile(false);
    }
  };

  const handleWebsiteAnalyze = (url: string) => {
    setCurrentStep('website-analysis');
  };

  const handlePDFUpload = () => {
    setCurrentStep('pdf-upload');
  };

  const handleCancelAnalysis = () => {
    setCurrentStep('select-method');
    setAnalysisFileName(null);
  };

  const loadPDFOfferData = async (offerId: string) => {
    const data = await loadOfferData(offerId, 'pdf');
    if (data) {
      setCurrentStep('review');
    }
  };

  const pollAnalysisStatus = async (offerId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const checkStatus = async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from('sponsorship_offers')
        .select('analysis_status')
        .eq('id', offerId)
        .single();

      if (error) {
        console.error('Error checking analysis status:', error);
        return false;
      }

      if (data.analysis_status === 'completed') {
        return true;
      } else if (data.analysis_status === 'failed' || data.analysis_status === 'error') {
        toast({
          title: "Analysis Failed",
          description: "Please try again or choose a different method.",
          variant: "destructive",
        });
        setCurrentStep('pdf-upload');
        setAnalysisFileName(null);
        return false;
      }

      return false;
    };

    while (attempts < maxAttempts) {
      const isComplete = await checkStatus();
      if (isComplete) {
        await loadPDFOfferData(offerId);
        setCurrentStep('review');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    toast({
      title: "Analysis Timeout",
      description: "The analysis is taking longer than expected. Please try again.",
      variant: "destructive",
    });
  };


  const handleQuestionnaireComplete = async (data: MultiStepOfferData) => {
    // Validate team profile exists
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Verify team profile exists
      const { data: teamProfile, error: profileError } = await supabase
        .from('team_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking team profile:', profileError);
        toast({
          title: "Profile Verification Failed",
          description: "We couldn't verify your team profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!teamProfile) {
        toast({
          title: "Profile Required First",
          description: "Please complete your team profile before creating sponsorship offers.",
          variant: "destructive",
        });
        setCurrentStep('create-profile');
        return;
      }

      toast({
        title: "Loading Your Offer",
        description: "Preparing your sponsorship offer for review...",
      });

      const offerData = await loadLatestQuestionnaireOffer();
      
      if (offerData) {
        setCurrentStep('review');
      } else {
        // If we can't load for review, stay in onboarding
        toast({
          title: "Offer Created",
          description: "Your offer was created but couldn't be loaded for review. Please refresh or try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error during questionnaire completion:', error);
      toast({
        title: "Error Loading Offer",
        description: "Your offer may have been created. Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  const handleReviewApprove = async () => {
    try {
      const success = await publishOffer();
      if (success) {
        // CRITICAL: Mark onboarding as FULLY completed
        // Set BOTH onboarding_completed AND current_onboarding_step to 'completed'
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
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
            return;
          }

          console.log('[TeamOnboarding] Onboarding completed successfully');
          
          toast({
            title: "Welcome to Sponsa!",
            description: "Your sponsorship offer is now live. Redirecting to dashboard...",
          });
          
          // Small delay to show success message
          setTimeout(() => {
            navigate('/team/dashboard', { replace: true });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'profile-review':
        setCurrentStep('create-profile');
        break;
      case 'select-method':
        setCurrentStep('profile-review');
        break;
      case 'website-analysis':
      case 'pdf-upload':
      case 'questionnaire':
        setCurrentStep('select-method');
        break;
      case 'review':
        // Go back to the method that was used to create the offer
        if (analysisFileName) {
          setCurrentStep('pdf-upload');
        } else {
          setCurrentStep('questionnaire');
        }
        break;
      default:
        break;
    }
  };

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <LoadingState 
        variant="page"
        size="lg"
        message="Loading Your Profile"
        submessage="Just a moment while we check your account status..."
      />
    );
  }

  // Show loading state during profile checks
  if (isCheckingProfile) {
    return (
      <LoadingState 
        variant="page"
        size="lg"
        message="Verifying Profile"
        submessage="Making sure everything is set up correctly..."
      />
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'create-profile':
        return (
          <CreateTeamProfile
            onAnalyzeWebsite={(url) => {
              setCurrentStep('profile-review');
            }}
            onFillManually={() => {
              setIsManualEntry(true);
              setCurrentStep('profile-review');
            }}
          />
        );

      case 'profile-review':
        return (
          <ProfileReview
            teamData={teamData}
            onApprove={handleProfileApprove}
            isManualEntry={isManualEntry}
            onProfileUpdate={handleProfileUpdate}
          />
        );

      case 'select-method':
        return (
          <CreateSponsorshipOffer
            onSelectMethod={handleSelectMethod}
          />
        );

      case 'website-analysis':
        return (
          <WebsiteAnalysisInput
            onAnalyze={async (url) => {
              toast({
                title: "Analysis Started",
                description: "We're analyzing your website...",
              });
              setCurrentStep('questionnaire');
            }}
            onBack={handleCancelAnalysis}
          />
        );

      case 'pdf-upload':
        return analysisFileName ? (
          <PDFAnalysisProgress
            fileName={analysisFileName}
            onCancel={handleCancelAnalysis}
          />
        ) : (
          <PDFUploadInput
            onUpload={async (fileUrl, fileName, file) => {
              try {
                // Validate file if provided
                if (file) {
                  const fileValidation = validatePDFFile(file);
                  if (!fileValidation.isValid) {
                    toast({
                      title: "Invalid File",
                      description: fileValidation.error,
                      variant: "destructive",
                    });
                    return;
                  }
                }

                setAnalysisFileName(fileName);
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                
                if (authError || !user) {
                  toast({
                    title: "Authentication Required",
                    description: "Your session has expired. Please log in again.",
                    variant: "destructive",
                  });
                  setAnalysisFileName(null);
                  navigate('/auth');
                  return;
                }

                // Fetch team_profile_id and validate it exists
                const { data: teamProfile, error: profileError } = await supabase
                  .from('team_profiles')
                  .select('id')
                  .eq('user_id', user.id)
                  .maybeSingle();

                if (profileError) {
                  console.error('Error fetching team profile:', profileError);
                  toast({
                    title: "Profile Verification Failed",
                    description: "We couldn't verify your team profile. Please try again or contact support.",
                    variant: "destructive",
                  });
                  setAnalysisFileName(null);
                  return;
                }

                if (!teamProfile) {
                  toast({
                    title: "Profile Required First",
                    description: "Please complete your team profile before uploading a sponsorship document.",
                    variant: "destructive",
                  });
                  setCurrentStep('create-profile');
                  setAnalysisFileName(null);
                  return;
                }

                toast({
                  title: "Analyzing Document",
                  description: "We're extracting sponsorship details from your PDF. This may take a moment...",
                });

                // Create sponsorship offer with required team_profile_id
                const { data: offerData, error: offerError } = await supabase
                  .from('sponsorship_offers')
                  .insert({
                    user_id: user.id,
                    team_profile_id: teamProfile.id,
                    title: `Sponsorship from ${fileName}`,
                    fundraising_goal: 0,
                    duration: 'TBD',
                    impact: 'Analysis in progress...',
                    pdf_public_url: fileUrl,
                    source_file_name: fileName,
                    analysis_status: 'pending',
                    source: 'pdf',
                    status: 'draft'
                  })
                  .select()
                  .single();

                if (offerError) {
                  console.error('Error creating offer:', offerError);
                  toast({
                    title: "Failed to Create Offer",
                    description: "We couldn't create your sponsorship offer. Please try again.",
                    variant: "destructive",
                  });
                  setAnalysisFileName(null);
                  return;
                }

                if (offerData) {
                  const { error: functionError } = await supabase.functions.invoke('analyze-pdf-sponsorship', {
                    body: { 
                      pdfUrl: fileUrl, 
                      offerId: offerData.id, 
                      userId: user.id,
                      teamProfileId: teamProfile.id
                    }
                  });

                  if (functionError) {
                    console.error('Error invoking analysis function:', functionError);
                    toast({
                      title: "Analysis Failed to Start",
                      description: "We couldn't start analyzing your document. Please try uploading again.",
                      variant: "destructive",
                    });
                    setAnalysisFileName(null);
                    return;
                  }

                  pollAnalysisStatus(offerData.id);
                }
              } catch (error) {
                console.error('Unexpected error during PDF upload:', error);
                toast({
                  title: "Upload Failed",
                  description: "An unexpected error occurred. Please try again.",
                  variant: "destructive",
                });
                setAnalysisFileName(null);
              }
            }}
            onBack={handleCancelAnalysis}
          />
        );

      case 'questionnaire':
        return (
          <QuestionnaireFlow
            onComplete={handleQuestionnaireComplete}
            onBack={handleBack}
          />
        );

      case 'review':
        if (!offerData || isLoading) {
          return (
            <LoadingState 
              variant="page"
              size="lg"
              message={loadingMessage || "Loading Offer Details"}
              submessage="Preparing your sponsorship offer for review..."
            />
          );
        }
        return (
          <SponsorshipReview
            sponsorshipData={offerData}
            teamData={teamData}
            onApprove={handleReviewApprove}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {renderStep()}
    </div>
  );
};

export default TeamOnboarding;
