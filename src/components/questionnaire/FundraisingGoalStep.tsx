import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface FundraisingGoalStepProps {
  initialValue?: string;
  onValueChange: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
}

const FundraisingGoalStep = ({
  initialValue = "",
  onValueChange,
  onValidityChange,
}: FundraisingGoalStepProps) => {
  const [goal, setGoal] = useState(initialValue);
  const [error, setError] = useState("");

  useEffect(() => {
    const numericGoal = parseFloat(goal);
    const isValid = goal !== "" && !isNaN(numericGoal) && numericGoal > 0;
    
    if (goal !== "" && !isValid) {
      setError("Please enter a valid amount greater than $0");
    } else {
      setError("");
    }
    
    onValidityChange(isValid);
    onValueChange(goal);
  }, [goal, onValueChange, onValidityChange]);

  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value.replace(/,/g, ""));
    if (isNaN(numericValue)) return value;
    return numericValue.toLocaleString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          What's your fundraising goal?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Set a target amount you'd like to raise through sponsorships
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-4">
        <div className="space-y-2">
          <label htmlFor="goal" className="text-sm font-medium text-foreground">
            Fundraising Goal
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
              }}
              placeholder="5000"
              className="pl-10 text-2xl h-14 font-semibold"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        {goal && !error && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Target: <span className="font-semibold text-foreground">${formatCurrency(goal)}</span>
            </p>
          </div>
        )}
      </Card>

      <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-secondary-foreground">💡 Tip</p>
        <p className="text-sm text-muted-foreground">
          Consider your team's annual expenses, equipment needs, and travel costs when setting your goal.
        </p>
      </div>
    </div>
  );
};

export default FundraisingGoalStep;
