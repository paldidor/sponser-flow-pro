import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Rocket, Link as LinkIcon } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AnalysisSpinner from "./AnalysisSpinner";

interface CreateTeamProfileProps {
  onAnalyzeWebsite: (url: string) => void;
  onFillManually: () => void;
}

const CreateTeamProfile = ({ onAnalyzeWebsite, onFillManually }: CreateTeamProfileProps) => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const { toast } = useToast();

  const extractDomain = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!profileId || !isAnalyzing) return;

    // Set a timeout to proceed even if webhook fails (30 seconds)
    const timeoutId = setTimeout(() => {
      if (isAnalyzing) {
        console.log("Webhook timeout - proceeding to review");
        setIsAnalyzing(false);
        toast({
          title: "Analysis taking longer than expected",
          description: "You can review and edit your profile manually.",
        });
        onAnalyzeWebsite(websiteUrl);
      }
    }, 30000);

    const channel = supabase
      .channel("team-profile-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "team_profiles",
          filter: `id=eq.${profileId}`,
        },
        (payload) => {
          console.log("Profile updated:", payload);
          const newData = payload.new as any;

          // Check if any meaningful field has been populated (not just timestamps)
          const hasData = newData.team_name || newData.team_bio || newData.location || newData.sport;

          if (hasData) {
            clearTimeout(timeoutId);
            setIsAnalyzing(false);
            toast({
              title: "Analysis complete!",
              description: "Your team profile has been created.",
            });
            onAnalyzeWebsite(websiteUrl);
          }
        },
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [profileId, isAnalyzing, websiteUrl, onAnalyzeWebsite, toast]);

  const handleContinue = async () => {
    if (!websiteUrl) return;

    if (!validateUrl(websiteUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const normalizedUrl = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
      const domain = extractDomain(websiteUrl);

      const { data, error } = await supabase
        .from("team_profiles")
        .insert({
          user_id: user.id,
          seed_url: normalizedUrl,
          domain: domain,
        })
        .select()
        .single();

      if (error) throw error;

      setProfileId(data.id);

      toast({
        title: "Analyzing website...",
        description: "We're extracting information from your website.",
      });

      // The realtime subscription will handle navigation when webhook updates the profile
    } catch (error: any) {
      console.error("Error creating team profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze website",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return <AnalysisSpinner type="website" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 mb-4">
          <CheckCircle className="w-12 h-12 text-accent" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-700">Welcome to Sponsa!</h1>
          <p className="text-lg text-gray-600">Account created - check! Now let’s get your org set up!</p>
        </div>

        <ProgressIndicator currentStep={2} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700">Complete Your Team Profile</h2>
          </div>

          <p className="text-gray-600">
            Enter your youth sports org’s website URL and we’ll generate your profile for you!
          </p>

          <div className="text-left space-y-3">
            <label className="text-sm font-semibold text-gray-700">Team Website URL</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="url"
                placeholder="https://your-team-website.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="pl-12 py-6 bg-accent/10 border-accent/30 text-gray-700 placeholder:text-gray-500"
              />
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Don't have a website? No problem! You can fill out your profile manually below.
          </p>

          <Button size="lg" className="w-full py-6 text-lg" onClick={handleContinue} disabled={!websiteUrl.trim()}>
            Continue
          </Button>

          <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-700" onClick={onFillManually}>
            Fill manually
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamProfile;
