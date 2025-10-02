import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreateTeamProfile from "@/components/CreateTeamProfile";
import ProfileReview from "@/components/ProfileReview";
import CreateSponsorshipOffer from "@/components/CreateSponsorshipOffer";
import QuestionnaireFlow from "@/components/questionnaire/QuestionnaireFlow";
import SponsorshipReview from "@/components/SponsorshipReview";
import WebsiteAnalysisInput from "@/components/WebsiteAnalysisInput";
import PDFUploadInput from "@/components/PDFUploadInput";
import PDFAnalysisProgress from "@/components/PDFAnalysisProgress";
import type { TeamProfile, SponsorshipData, SponsorshipPackage, MultiStepOfferData } from "@/types/flow";

type OnboardingStep =
  | 'create-profile'
  | 'profile-review'
  | 'select-method'
  | 'website-analysis'
  | 'pdf-upload'
  | 'questionnaire'
  | 'review';

const TeamOnboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('create-profile');
  const [teamData, setTeamData] = useState<TeamProfile | null>(null);
  const [sponsorshipData, setSponsorshipData] = useState<SponsorshipData | null>(null);
  const [analysisFileName, setAnalysisFileName] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user already has a profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from('team_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking team profile:', profileError);
        // Stay on 'create-profile' step on error
        return;
      }

      if (profile) {
        setCurrentStep('select-method');
      }
    };

    checkExistingProfile();
  }, []);

  // ... keep existing code (handler functions)
  const handleProfileApprove = () => {
    setCurrentStep('select-method');
  };

  const handleSelectMethod = (method: "form" | "website" | "pdf", url?: string) => {
    if (method === "form") {
      setCurrentStep('questionnaire');
    } else if (method === "website") {
      setCurrentStep('website-analysis');
    } else {
      setCurrentStep('pdf-upload');
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
    try {
      // Load offer with packages and placements
      const { data: offer, error: offerError } = await supabase
        .from('sponsorship_offers')
        .select(`
          *,
          sponsorship_packages (
            id,
            name,
            price,
            benefits,
            description,
            package_placements (
              placement_option_id,
              placement_options (
                id,
                name,
                category,
                description
              )
            )
          )
        `)
        .eq('id', offerId)
        .single();

      if (offerError) throw offerError;

      // Format the data for SponsorshipReview
      const formattedData: SponsorshipData = {
        fundraisingGoal: offer.fundraising_goal?.toString() || '0',
        duration: offer.duration || 'TBD',
        description: offer.description || '',
        packages: offer.sponsorship_packages?.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          benefits: pkg.benefits || [],
          placements: pkg.package_placements?.map((pp: any) => 
            pp.placement_options?.name || ''
          ).filter(Boolean) || []
        })) || [],
        source: 'pdf',
        fileName: offer.source_file_name || undefined
      };

      setSponsorshipData(formattedData);
    } catch (error) {
      console.error('Error loading PDF offer data:', error);
      toast({
        title: "Error",
        description: "Failed to load analyzed data. Please try again.",
        variant: "destructive",
      });
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
    // Load the most recent published offer from questionnaire source for review
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find the most recent published questionnaire offer
      const { data: offer, error } = await supabase
        .from('sponsorship_offers')
        .select(`
          *,
          sponsorship_packages (
            id,
            name,
            price,
            benefits,
            description,
            package_placements (
              placement_option_id,
              placement_options (
                id,
                name,
                category,
                description
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('source', 'questionnaire')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (offer) {
        setCurrentOfferId(offer.id);
        
        const formattedData: SponsorshipData = {
          fundraisingGoal: offer.fundraising_goal?.toString() || '0',
          duration: offer.duration || 'TBD',
          description: offer.description || '',
          packages: offer.sponsorship_packages?.map((pkg: any) => ({
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            benefits: pkg.benefits || [],
            placements: pkg.package_placements?.map((pp: any) => 
              pp.placement_options?.name || ''
            ).filter(Boolean) || []
          })) || [],
          source: 'form'
        };

        setSponsorshipData(formattedData);
        setCurrentStep('review');
      }
    } catch (error) {
      console.error('Error loading offer data:', error);
      toast({
        title: "Success!",
        description: "Your sponsorship offer has been created.",
      });
      // If we can't load for review, just go to dashboard
      navigate('/team/dashboard');
    }
  };

  const handleReviewApprove = async () => {
    try {
      if (currentOfferId) {
        const { error } = await supabase
          .from('sponsorship_offers')
          .update({ status: 'published' })
          .eq('id', currentOfferId);

        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: "Your sponsorship offer has been published.",
      });

      navigate('/team/dashboard');
    } catch (error) {
      console.error('Error publishing offer:', error);
      toast({
        title: "Error",
        description: "Failed to publish offer. Please try again.",
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
            onUpload={async (fileUrl, fileName) => {
              setAnalysisFileName(fileName);
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              // Fetch team_profile_id
              const { data: teamProfile } = await supabase
                .from('team_profiles')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

              const { data: offerData } = await supabase
                .from('sponsorship_offers')
                .insert({
                  user_id: user.id,
                  team_profile_id: teamProfile?.id || null,
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

              if (offerData) {
                setCurrentOfferId(offerData.id);
                await supabase.functions.invoke('analyze-pdf-sponsorship', {
                  body: { 
                    pdfUrl: fileUrl, 
                    offerId: offerData.id, 
                    userId: user.id,
                    teamProfileId: teamProfile?.id || null
                  }
                });
                pollAnalysisStatus(offerData.id);
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
        if (!sponsorshipData) {
          return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
        }
        return (
          <SponsorshipReview
            sponsorshipData={sponsorshipData}
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
