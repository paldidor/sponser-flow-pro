import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, TrendingUp } from "lucide-react";

interface DurationSelectionStepProps {
  initialValue?: string;
  onValueChange: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
}

const durationOptions = [
  {
    value: "Season",
    label: "Season",
    description: "Single season commitment",
    icon: Calendar,
    details: "Perfect for short-term partnerships",
  },
  {
    value: "1-year",
    label: "1 Year",
    description: "Annual partnership",
    icon: Clock,
    details: "Most common sponsorship term",
  },
  {
    value: "Multi Year",
    label: "Multi-Year",
    description: "Long-term commitment",
    icon: TrendingUp,
    details: "Best value for ongoing support",
  },
];

const DurationSelectionStep = ({
  initialValue = "",
  onValueChange,
  onValidityChange,
}: DurationSelectionStepProps) => {
  const [selectedDuration, setSelectedDuration] = useState(initialValue);

  useEffect(() => {
    const isValid = selectedDuration !== "";
    onValidityChange(isValid);
    onValueChange(selectedDuration);
  }, [selectedDuration, onValueChange, onValidityChange]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          How long is the sponsorship?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Choose the duration for your sponsorship packages
        </p>
      </div>

      <RadioGroup value={selectedDuration} onValueChange={setSelectedDuration}>
        <div className="space-y-3">
          {durationOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedDuration === option.value;
            
            return (
              <Card
                key={option.value}
                className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedDuration(option.value)}
              >
                <div className="flex items-start gap-4">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={option.value}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-base text-foreground">
                          {option.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </Label>
                    {isSelected && (
                      <p className="mt-2 text-sm text-primary font-medium">
                        ✓ {option.details}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </RadioGroup>

      {!selectedDuration && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Select a duration to continue
          </p>
        </div>
      )}
    </div>
  );
};

export default DurationSelectionStep;
