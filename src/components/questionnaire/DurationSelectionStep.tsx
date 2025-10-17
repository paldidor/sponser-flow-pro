import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, TrendingUp, CheckCircle2, CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DurationSelectionStepProps {
  initialValue?: string;
  initialSeasonStart?: string;
  initialSeasonEnd?: string;
  initialDurationYears?: number;
  onValueChange: (data: {
    duration: string;
    seasonStartDate?: string;
    seasonEndDate?: string;
    durationYears?: number;
  }) => void;
  onValidityChange: (isValid: boolean) => void;
}

const durationOptions = [
  {
    value: "Season",
    label: "Season",
    description: "Single season commitment",
    icon: CalendarIcon,
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

const yearOptions = [
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "4", label: "4 years" },
  { value: "5", label: "5 years" },
  { value: "10", label: "10 years" },
];

const DurationSelectionStep = ({
  initialValue = "",
  initialSeasonStart,
  initialSeasonEnd,
  initialDurationYears,
  onValueChange,
  onValidityChange,
}: DurationSelectionStepProps) => {
  const [selectedDuration, setSelectedDuration] = useState(initialValue);
  const [seasonStartDate, setSeasonStartDate] = useState<Date | undefined>(
    initialSeasonStart ? new Date(initialSeasonStart) : undefined
  );
  const [seasonEndDate, setSeasonEndDate] = useState<Date | undefined>(
    initialSeasonEnd ? new Date(initialSeasonEnd) : undefined
  );
  const [durationYears, setDurationYears] = useState<string>(
    initialDurationYears?.toString() || ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const newErrors: Record<string, string> = {};
    let isValid = false;

    if (selectedDuration === "Season") {
      if (!seasonStartDate) {
        newErrors.seasonStart = "Start date is required";
      }
      if (!seasonEndDate) {
        newErrors.seasonEnd = "End date is required";
      }
      if (seasonStartDate && seasonEndDate && seasonEndDate <= seasonStartDate) {
        newErrors.seasonEnd = "End date must be after start date";
      }
      isValid = !!seasonStartDate && !!seasonEndDate && !newErrors.seasonEnd;
    } else if (selectedDuration === "1-year") {
      isValid = true;
    } else if (selectedDuration === "Multi Year") {
      if (!durationYears) {
        newErrors.years = "Number of years is required";
      }
      isValid = !!durationYears;
    }

    setErrors(newErrors);
    onValidityChange(isValid && !!selectedDuration);

    if (isValid && selectedDuration) {
      onValueChange({
        duration: selectedDuration,
        seasonStartDate: seasonStartDate ? format(seasonStartDate, "yyyy-MM-dd") : undefined,
        seasonEndDate: seasonEndDate ? format(seasonEndDate, "yyyy-MM-dd") : undefined,
        durationYears: durationYears ? parseInt(durationYears) : undefined,
      });
    }
  }, [selectedDuration, seasonStartDate, seasonEndDate, durationYears, onValueChange, onValidityChange]);

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
                      <div className="ml-14 space-y-3 animate-fade-in">
                        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                          <p className="text-sm text-primary font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            {option.details}
                          </p>
                        </div>

                        {/* Season-specific fields */}
                        {option.value === "Season" && (
                          <div className="space-y-4 p-4 bg-background rounded-lg border">
                            <div className="space-y-2">
                              <Label htmlFor="season-start" className="text-sm font-medium">
                                Season Start Date
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="season-start"
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !seasonStartDate && "text-muted-foreground",
                                      errors.seasonStart && "border-destructive"
                                    )}
                                  >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {seasonStartDate ? format(seasonStartDate, "PPP") : "Pick start date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={seasonStartDate}
                                    onSelect={setSeasonStartDate}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                              {errors.seasonStart && (
                                <p className="text-xs text-destructive">{errors.seasonStart}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="season-end" className="text-sm font-medium">
                                Season End Date
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="season-end"
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !seasonEndDate && "text-muted-foreground",
                                      errors.seasonEnd && "border-destructive"
                                    )}
                                  >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {seasonEndDate ? format(seasonEndDate, "PPP") : "Pick end date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={seasonEndDate}
                                    onSelect={setSeasonEndDate}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                              {errors.seasonEnd && (
                                <p className="text-xs text-destructive">{errors.seasonEnd}</p>
                              )}
                            </div>

                            {seasonStartDate && seasonEndDate && seasonEndDate > seasonStartDate && (
                              <div className="p-3 bg-accent/10 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                  <strong>Season Duration:</strong>{" "}
                                  {Math.ceil(
                                    (seasonEndDate.getTime() - seasonStartDate.getTime()) /
                                      (1000 * 60 * 60 * 24 * 30)
                                  )}{" "}
                                  months
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Multi-Year specific fields */}
                        {option.value === "Multi Year" && (
                          <div className="space-y-4 p-4 bg-background rounded-lg border">
                            <div className="space-y-2">
                              <Label htmlFor="duration-years" className="text-sm font-medium">
                                Number of Years
                              </Label>
                              <Select value={durationYears} onValueChange={setDurationYears}>
                                <SelectTrigger
                                  id="duration-years"
                                  className={cn(
                                    "w-full",
                                    errors.years && "border-destructive"
                                  )}
                                >
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  {yearOptions.map((year) => (
                                    <SelectItem key={year.value} value={year.value}>
                                      {year.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.years && (
                                <p className="text-xs text-destructive">{errors.years}</p>
                              )}
                            </div>

                            {durationYears && (
                              <div className="p-3 bg-accent/10 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                  <strong>Commitment:</strong> {durationYears}-year partnership
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Longer commitments often secure better pricing and build stronger relationships
                                </p>
                              </div>
                            )}
                          </div>
                        )}
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
