import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SubmittingOverlayProps {
  isSubmitting: boolean;
}

export function SubmittingOverlay({ isSubmitting }: SubmittingOverlayProps) {
  if (!isSubmitting) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="p-8 space-y-4 text-center max-w-md mx-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <div className="space-y-2">
          <p className="text-xl font-bold text-foreground">Creating your sponsorship offer...</p>
          <p className="text-sm text-muted-foreground">
            We're finalizing your packages and placements. This may take a few moments.
          </p>
        </div>
      </Card>
    </div>
  );
}
