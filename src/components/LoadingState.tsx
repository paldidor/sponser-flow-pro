import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  variant?: "page" | "inline" | "card";
  size?: "sm" | "md" | "lg";
}

const LoadingState = ({ 
  message = "Loading...", 
  submessage,
  variant = "inline",
  size = "md" 
}: LoadingStateProps) => {
  const spinnerSizes = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const content = (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <Loader2 className={`${spinnerSizes[size]} animate-spin text-primary`} />
      </div>
      <div className="space-y-2">
        <p className={`${textSizes[size]} font-medium text-foreground`}>{message}</p>
        {submessage && (
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{submessage}</p>
        )}
      </div>
    </div>
  );

  if (variant === "page") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        {content}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className="p-8">
        {content}
      </Card>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      {content}
    </div>
  );
};

export default LoadingState;
