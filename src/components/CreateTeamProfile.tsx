import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Rocket, Link as LinkIcon } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";

interface CreateTeamProfileProps {
  onAnalyzeWebsite: (url: string) => void;
  onFillManually: () => void;
}

const CreateTeamProfile = ({ onAnalyzeWebsite, onFillManually }: CreateTeamProfileProps) => {
  const [websiteUrl, setWebsiteUrl] = useState("");

  const handleContinue = () => {
    if (websiteUrl.trim()) {
      onAnalyzeWebsite(websiteUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 mb-4">
          <CheckCircle className="w-12 h-12 text-accent" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-700">Congratulations!</h1>
          <p className="text-lg text-gray-600">
            Your account has been created. Now let's get your team set up!
          </p>
        </div>

        <ProgressIndicator currentStep={2} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700">Complete Team Profile</h2>
          </div>

          <p className="text-gray-600">
            Let's get your team set up! Enter your team's website URL and we'll automatically pull your profile details, images, and information.
          </p>

          <div className="text-left space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Team Website URL
            </label>
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

          <Button
            size="lg"
            className="w-full py-6 text-lg"
            onClick={handleContinue}
            disabled={!websiteUrl.trim()}
          >
            Continue
          </Button>

          <Button
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-700"
            onClick={onFillManually}
          >
            Fill manually
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamProfile;
