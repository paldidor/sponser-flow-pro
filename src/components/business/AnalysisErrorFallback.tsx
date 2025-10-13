import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw, FileText, Globe } from "lucide-react";

interface AnalysisErrorFallbackProps {
  error?: string;
  websiteUrl: string;
  onRetry: () => void;
  onManualEntry: () => void;
  onTryDifferentWebsite: () => void;
}

const AnalysisErrorFallback = ({
  error,
  websiteUrl,
  onRetry,
  onManualEntry,
  onTryDifferentWebsite,
}: AnalysisErrorFallbackProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </div>

          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-bold">Analysis Failed</h2>
            <p className="text-muted-foreground">
              We couldn't analyze your website. This could be due to connection issues
              or the website structure.
            </p>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Attempted website:</p>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <p className="font-mono text-sm break-all">{websiteUrl}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={onRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button
              onClick={onManualEntry}
              className="w-full"
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              Fill Manually Instead
            </Button>

            <Button
              onClick={onTryDifferentWebsite}
              className="w-full"
              variant="ghost"
            >
              <Globe className="w-4 h-4 mr-2" />
              Try Different Website
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Don't worry, you can always update your profile later
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisErrorFallback;
