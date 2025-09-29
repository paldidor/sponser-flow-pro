import { Loader2 } from "lucide-react";

interface AnalysisSpinnerProps {
  type: "website" | "pdf";
  fileName?: string;
}

const AnalysisSpinner = ({ type, fileName }: AnalysisSpinnerProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            {type === "website" ? "Analyzing Website..." : "Analyzing PDF..."}
          </h2>
          <p className="text-muted-foreground">
            {type === "website"
              ? "We're extracting sponsorship information from your website"
              : `Processing ${fileName || "your document"}...`}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};

export default AnalysisSpinner;
