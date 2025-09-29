import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Globe, ArrowLeft } from "lucide-react";

interface WebsiteAnalysisInputProps {
  onAnalyze: (url: string) => void;
  onBack: () => void;
  initialUrl?: string;
}

const WebsiteAnalysisInput = ({ onAnalyze, onBack, initialUrl = "" }: WebsiteAnalysisInputProps) => {
  const [url, setUrl] = useState(initialUrl);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <Button
          variant="ghost"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground mb-4">
            <Globe className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold">Import from Website</h1>
          <p className="text-muted-foreground">
            Enter your website URL and we'll automatically extract sponsorship information
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Team Website URL</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://your-team-website.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={() => onAnalyze(url)}
            disabled={!url}
          >
            Analyze Website
          </Button>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don't have a website? No problem! You can{" "}
          <button
            className="text-primary font-medium hover:underline"
            onClick={onBack}
          >
            fill out your profile manually
          </button>
        </p>
      </div>
    </div>
  );
};

export default WebsiteAnalysisInput;
