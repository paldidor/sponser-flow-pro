import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

interface CreateBusinessProfileProps {
  onComplete: () => void;
  onManualEntry: () => void;
}

const CreateBusinessProfile = ({ onComplete, onManualEntry }: CreateBusinessProfileProps) => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { createProfile } = useBusinessProfile();

  const validateUrl = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      return null;
    }
  };

  const handleWebsiteSubmit = async () => {
    const domain = validateUrl(websiteUrl);
    
    if (!domain) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL (e.g., example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const normalizedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
      
      const { error } = await createProfile({
        business_name: '', // Will be populated by analysis
        industry: '', // Will be populated by analysis
        city: '', // Will be populated by analysis
        state: '', // Will be populated by analysis
        seed_url: normalizedUrl,
        website: normalizedUrl,
        domain: domain,
        current_onboarding_step: 'business_profile',
        analysis_status: 'pending',
        analysis_started_at: new Date().toISOString(),
      } as any);

      if (error) throw error;

      toast({
        title: "Website Submitted",
        description: "Analyzing your business website...",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error creating business profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit website. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Globe className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Create Your Business Profile</h2>
        <p className="text-muted-foreground text-lg">
          Choose how you'd like to set up your business profile
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Website Analysis Option */}
        <div className="bg-card border-2 border-border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Import from Website</h3>
            <p className="text-sm text-muted-foreground">
              We'll analyze your website to automatically fill in your business details
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="website">Website URL</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                type="text"
                placeholder="www.yourbusiness.com"
                className="pl-10"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleWebsiteSubmit()}
                disabled={isAnalyzing}
              />
            </div>
            <Button
              onClick={handleWebsiteSubmit}
              disabled={!websiteUrl || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Website"}
            </Button>
          </div>
        </div>

        {/* Manual Entry Option */}
        <div className="bg-card border-2 border-border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Fill Manually</h3>
            <p className="text-sm text-muted-foreground">
              Prefer to enter your business information yourself? No problem!
            </p>
          </div>

          <div className="flex-1 flex items-end">
            <Button
              variant="outline"
              onClick={onManualEntry}
              className="w-full"
            >
              Enter Manually
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Don't worry, you'll be able to review and edit all information before finalizing your profile.
        </p>
      </div>
    </div>
  );
};

export default CreateBusinessProfile;
