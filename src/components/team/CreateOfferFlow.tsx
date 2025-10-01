import { useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const CreateSponsorshipOffer = lazy(() => import("@/components/CreateSponsorshipOffer"));
const QuestionnaireFlow = lazy(() => import("@/components/questionnaire/QuestionnaireFlow"));
const PDFUploadInput = lazy(() => import("@/components/PDFUploadInput"));
const PDFAnalysisProgress = lazy(() => import("@/components/PDFAnalysisProgress"));
const WebsiteAnalysisInput = lazy(() => import("@/components/WebsiteAnalysisInput"));
const AnalysisSpinner = lazy(() => import("@/components/AnalysisSpinner"));

type FlowStep = 'select-method' | 'questionnaire' | 'pdf-upload' | 'pdf-analysis' | 'website-input' | 'website-analysis';

interface CreateOfferFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

const CreateOfferFlow = ({ onComplete, onCancel }: CreateOfferFlowProps) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('select-method');
  const [analysisFileName, setAnalysisFileName] = useState<string | null>(null);
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSelectMethod = (method: "form" | "website" | "pdf", url?: string) => {
    if (method === "form") {
      setCurrentStep('questionnaire');
    } else if (method === "website") {
      setCurrentStep('website-input');
    } else {
      setCurrentStep('pdf-upload');
    }
  };

  const handlePDFUpload = async (fileUrl: string, fileName: string) => {
    setAnalysisFileName(fileName);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: offerData } = await supabase
      .from('sponsorship_offers')
      .insert({
        user_id: user.id,
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
      setCurrentStep('pdf-analysis');
      
      await supabase.functions.invoke('analyze-pdf-sponsorship', {
        body: { pdfUrl: fileUrl, offerId: offerData.id, userId: user.id }
      });
      
      pollAnalysisStatus(offerData.id);
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
      } else if (data.analysis_status === 'failed') {
        toast({
          title: "Analysis Failed",
          description: "Please try again or choose a different method.",
          variant: "destructive",
        });
        return false;
      }

      return false;
    };

    while (attempts < maxAttempts) {
      const isComplete = await checkStatus();
      if (isComplete) {
        toast({
          title: "Analysis Complete",
          description: "Your sponsorship packages have been created!",
        });
        onComplete();
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

  const handleWebsiteAnalyze = async (url: string) => {
    setCurrentStep('website-analysis');
    
    // Simulate website analysis (you can replace this with actual API call)
    setTimeout(() => {
      toast({
        title: "Analysis Complete",
        description: "Your sponsorship packages have been created!",
      });
      onComplete();
    }, 5000);
  };

  const handleQuestionnaireComplete = () => {
    toast({
      title: "Success!",
      description: "Your sponsorship offer has been created",
    });
    onComplete();
  };

  const handleBack = () => {
    if (currentStep === 'questionnaire' || currentStep === 'pdf-upload' || currentStep === 'website-input') {
      setCurrentStep('select-method');
    } else if (currentStep === 'pdf-analysis') {
      setCurrentStep('pdf-upload');
      setAnalysisFileName(null);
    } else if (currentStep === 'website-analysis') {
      setCurrentStep('website-input');
    }
  };

  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'select-method':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CreateSponsorshipOffer onSelectMethod={handleSelectMethod} />
          </Suspense>
        );

      case 'questionnaire':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <QuestionnaireFlow
              onComplete={handleQuestionnaireComplete}
              onBack={handleBack}
            />
          </Suspense>
        );

      case 'pdf-upload':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PDFUploadInput
              onUpload={handlePDFUpload}
              onBack={handleBack}
            />
          </Suspense>
        );

      case 'pdf-analysis':
        return (
          <Suspense fallback={<LoadingFallback />}>
            {analysisFileName && (
              <PDFAnalysisProgress
                fileName={analysisFileName}
                onCancel={onCancel}
              />
            )}
          </Suspense>
        );

      case 'website-input':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <WebsiteAnalysisInput
              onAnalyze={handleWebsiteAnalyze}
              onBack={handleBack}
            />
          </Suspense>
        );

      case 'website-analysis':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AnalysisSpinner type="website" />
          </Suspense>
        );

      default:
        return null;
    }
  };

  return renderStep();
};

export default CreateOfferFlow;
