import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Globe, FileText, Clock, ArrowRight } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import { useState } from "react";

interface CreateSponsorshipOfferProps {
  onSelectMethod: (method: "form" | "website" | "pdf", url?: string) => void;
}

const CreateSponsorshipOffer = ({ onSelectMethod }: CreateSponsorshipOfferProps) => {
  const [websiteUrl, setWebsiteUrl] = useState("");

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
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
              <Button
                className="w-full"
                onClick={() => onSelectMethod("pdf")}
              >
                Upload PDF
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
