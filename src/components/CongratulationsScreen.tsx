import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import { useEffect } from "react";

interface CongratulationsScreenProps {
  onContinue: () => void;
}

const CongratulationsScreen = ({ onContinue }: CongratulationsScreenProps) => {
  useEffect(() => {
    // Auto-advance after 2 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 mb-4">
          <CheckCircle className="w-12 h-12 text-accent" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Congratulations!</h1>
          <p className="text-lg text-muted-foreground">
            Your account has been created. Now let's get your team set up!
          </p>
        </div>

        <ProgressIndicator currentStep={2} />

        <Button
          size="lg"
          className="px-12 py-6"
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default CongratulationsScreen;
