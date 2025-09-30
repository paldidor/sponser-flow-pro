import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Target } from "lucide-react";

interface FundraisingGoalStepProps {
  initialValue?: string;
  onValueChange: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
}

const suggestedGoals = [
  { amount: 5000, label: "Starter" },
  { amount: 10000, label: "Standard" },
  { amount: 25000, label: "Growth" },
  { amount: 50000, label: "Advanced" },
];

const FundraisingGoalStep = ({
  initialValue = "",
  onValueChange,
  onValidityChange,
}: FundraisingGoalStepProps) => {
  const [goal, setGoal] = useState(initialValue);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const numericGoal = parseFloat(goal);
    const isValid = goal !== "" && !isNaN(numericGoal) && numericGoal > 0;
    
    if (touched && goal !== "" && !isValid) {
      setError("Please enter a valid amount greater than $0");
    } else if (touched && numericGoal > 0 && numericGoal < 500) {
      setError("Minimum fundraising goal is $500");
    } else {
      setError("");
    }
    
    onValidityChange(isValid && numericGoal >= 500);
    onValueChange(goal);
  }, [goal, touched, onValueChange, onValidityChange]);

  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value.replace(/,/g, ""));
    if (isNaN(numericValue)) return value;
    return numericValue.toLocaleString();
  };

  const handleQuickSelect = (amount: number) => {
    setGoal(amount.toString());
    setTouched(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Set Your Fundraising Goal
          </h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground">
          Choose a realistic target that covers your team's needs for the season
        </p>
      </div>

      {/* Quick Select Amounts */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Quick Select</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {suggestedGoals.map((suggestion) => (
            <Card
              key={suggestion.amount}
              className={`p-4 cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                goal === suggestion.amount.toString()
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleQuickSelect(suggestion.amount)}
            >
              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-foreground">
                  ${(suggestion.amount / 1000).toFixed(0)}k
                </p>
                <Badge variant="outline" className="text-xs">
                  {suggestion.label}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Amount Input */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="space-y-2">
          <label htmlFor="goal" className="text-sm font-medium text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Custom Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="goal"
              type="text"
              inputMode="numeric"
              value={goal}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setGoal(value);
                setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              placeholder="Enter custom amount"
              className={`pl-10 text-2xl h-14 font-semibold transition-all ${
                error ? "border-destructive" : goal ? "border-primary" : ""
              }`}
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive animate-fade-in">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        {goal && !error && parseFloat(goal) >= 500 && (
          <div className="pt-4 border-t border-border space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Your Goal:</p>
              <p className="text-2xl font-bold text-primary">
                ${formatCurrency(goal)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Great! This is a solid fundraising target</span>
            </div>
          </div>
        )}
      </Card>

      {/* Tips Section */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-4 bg-secondary/30 border-secondary">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-secondary-foreground flex items-center gap-2">
              💡 Consider Including
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Equipment & uniforms</li>
              <li>Travel & accommodation</li>
              <li>Facility rentals</li>
              <li>Tournament fees</li>
            </ul>
          </div>
        </Card>
        <Card className="p-4 bg-accent/10 border-accent/50">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-accent-foreground flex items-center gap-2">
              📊 Average Goals
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Youth teams: <strong>$5k - $15k</strong></li>
              <li>Club teams: <strong>$15k - $35k</strong></li>
              <li>Competitive: <strong>$35k+</strong></li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FundraisingGoalStep;
