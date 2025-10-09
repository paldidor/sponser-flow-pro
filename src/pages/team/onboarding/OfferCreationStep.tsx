import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validatePDFFile } from "@/lib/validationUtils";
import { OnboardingStep } from "@/lib/onboardingHelpers";
import CreateSponsorshipOffer from "@/components/CreateSponsorshipOffer";
import WebsiteAnalysisInput from "@/components/WebsiteAnalysisInput";
import PDFUploadInput from "@/components/PDFUploadInput";
import PDFAnalysisProgress from "@/components/PDFAnalysisProgress";
import QuestionnaireFlow from "@/components/questionnaire/QuestionnaireFlow";
import type { MultiStepOfferData } from "@/types/flow";

interface OfferCreationStepProps {
  currentStep: OnboardingStep;
  analysisFileName: string | null;
  onStepChange: (step: OnboardingStep) => void;
  onAnalysisFileNameChange: (fileName: string | null) => void;
  onQuestionnaireComplete: (data: MultiStepOfferData) => Promise<void>;
  onPDFPollingStart: (offerId: string) => void;
  onBack: () => void;
  verifyTeamProfile: () => Promise<boolean>;
}

export const OfferCreationStep = ({
  currentStep,
  analysisFileName,
  onStepChange,
  onAnalysisFileNameChange,
  onQuestionnaireComplete,
  onPDFPollingStart,
  onBack,
  verifyTeamProfile,
}: OfferCreationStepProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSelectMethod = async (method: "form" | "website" | "pdf") => {
    const isValid = await verifyTeamProfile();
    if (!isValid) return;

    if (method === "form") {
      onStepChange('questionnaire');
    } else if (method === "website") {
      onStepChange('website-analysis');
    } else {
      onStepChange('pdf-upload');
    }
  };

  const handleCancelAnalysis = () => {
    onStepChange('select-method');
    onAnalysisFileNameChange(null);
  };

  if (currentStep === 'select-method') {
    return <CreateSponsorshipOffer onSelectMethod={handleSelectMethod} />;
  }

  if (currentStep === 'website-analysis') {
    return (
      <WebsiteAnalysisInput
        onAnalyze={async (url) => {
          toast({
            title: "Analysis Started",
            description: "We're analyzing your website...",
          });
          onStepChange('questionnaire');
        }}
        onBack={handleCancelAnalysis}
      />
    );
  }

  if (currentStep === 'pdf-upload') {
    if (analysisFileName) {
      return (
        <PDFAnalysisProgress
          fileName={analysisFileName}
          onCancel={handleCancelAnalysis}
        />
      );
    }

    return (
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

            onAnalysisFileNameChange(fileName);
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError || !user) {
              toast({
                title: "Authentication Required",
                description: "Your session has expired. Please log in again.",
                variant: "destructive",
              });
              onAnalysisFileNameChange(null);
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
              onAnalysisFileNameChange(null);
              return;
            }

            if (!teamProfile) {
              toast({
                title: "Profile Required First",
                description: "Please complete your team profile before uploading a sponsorship document.",
                variant: "destructive",
              });
              onStepChange('create-profile');
              onAnalysisFileNameChange(null);
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
              onAnalysisFileNameChange(null);
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
                onAnalysisFileNameChange(null);
                return;
              }

              onPDFPollingStart(offerData.id);
            }
          } catch (error) {
            console.error('Unexpected error during PDF upload:', error);
            toast({
              title: "Upload Failed",
              description: "An unexpected error occurred. Please try again.",
              variant: "destructive",
            });
            onAnalysisFileNameChange(null);
          }
        }}
        onBack={handleCancelAnalysis}
      />
    );
  }

  if (currentStep === 'questionnaire') {
    return (
      <QuestionnaireFlow
        onComplete={onQuestionnaireComplete}
        onBack={onBack}
      />
    );
  }

  return null;
};
