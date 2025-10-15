import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Globe, FileText, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validatePDFFile } from "@/lib/validationUtils";

interface CreateSponsorshipOfferProps {
  onSelectMethod: (method: "form" | "website" | "pdf", url?: string) => void;
  onPDFUpload?: (fileUrl: string, fileName: string, file: File) => void;
  onCancel?: () => void;
}

const CreateSponsorshipOffer = ({ onSelectMethod, onPDFUpload, onCancel }: CreateSponsorshipOfferProps) => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePDFClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validatePDFFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${timestamp}_${sanitizedFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sponsorship-pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('sponsorship-pdfs')
        .getPublicUrl(filePath);

      if (onPDFUpload) {
        onPDFUpload(publicUrl, file.name, file);
      } else {
        onSelectMethod("pdf");
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {onCancel && (
          <Button
            variant="ghost"
            onClick={onCancel}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        )}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create Sponsorship Offer</h1>
          <p className="text-muted-foreground">
            Choose how you'd like to create your sponsorship packages & we'll build your offer!
          </p>
        </div>

        <ProgressIndicator currentStep={3} />

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-2 border-primary bg-primary/5 relative">
            <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
              Recommended
            </Badge>
            <div className="text-center space-y-4 mt-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload PDF</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Have a sponsorship deck? Upload it & we'll create your offer automatically.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-primary">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Best Method
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                className="w-full"
                onClick={handlePDFClick}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload PDF"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-2 hover:border-primary transition-colors">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground">
                <Globe className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Import from Website</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Already have sponsorship information on your website? We'll extract it automatically
                </p>
                <Input
                  placeholder="Enter your website URL"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="mb-2"
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onSelectMethod("website", websiteUrl)}
                disabled={!websiteUrl}
              >
                Import Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-2 hover:border-primary transition-colors">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Answer Questions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll guide you through a simple questionnaire to build your sponsorship packages
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  2-3 minutes
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onSelectMethod("form")}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateSponsorshipOffer;
