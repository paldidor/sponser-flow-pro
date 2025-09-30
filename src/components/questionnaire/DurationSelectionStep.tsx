import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, CheckCircle2 } from "lucide-react";

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
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Sponsorship Duration
          </h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground">
          Select the commitment period that works best for your team
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
                className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                  isSelected
                    ? "ring-2 ring-primary bg-primary/5 shadow-md"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedDuration(option.value)}
              >
                <div className="flex items-start gap-4">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 space-y-3">
                    <Label
                      htmlFor={option.value}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <div className={`p-3 rounded-lg transition-colors ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-lg text-foreground">
                            {option.label}
                          </p>
                          {isSelected && (
                            <Badge variant="default" className="animate-fade-in">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </Label>
                    {isSelected && (
                      <div className="ml-14 p-3 bg-primary/10 rounded-lg border border-primary/20 animate-fade-in">
                        <p className="text-sm text-primary font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          {option.details}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </RadioGroup>

      {!selectedDuration ? (
        <Card className="p-4 bg-muted/30 border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            👆 Choose a duration option to continue
          </p>
        </Card>
      ) : (
        <Card className="p-4 bg-accent/10 border-accent/50">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-accent-foreground flex items-center gap-2">
              📅 Duration Tip
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Multi-year commitments</strong> often attract larger sponsors 
              looking for stable, long-term partnerships with better visibility ROI.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DurationSelectionStep;
