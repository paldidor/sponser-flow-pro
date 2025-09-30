import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Award, CheckCircle2 } from "lucide-react";

interface SupportedPlayersStepProps {
  initialValue?: number;
  onValueChange: (value: number) => void;
  onValidityChange: (isValid: boolean) => void;
}

const SupportedPlayersStep = ({
  initialValue,
  onValueChange,
  onValidityChange,
}: SupportedPlayersStepProps) => {
  const [players, setPlayers] = useState(initialValue?.toString() || "");
  const [error, setError] = useState("");

  useEffect(() => {
    const numericPlayers = parseInt(players);
    const isValid = players !== "" && !isNaN(numericPlayers) && numericPlayers > 0;
    
    if (players !== "" && !isValid) {
      setError("Please enter a valid number of players");
    } else {
      setError("");
    }
    
    onValidityChange(isValid);
    if (isValid) {
      onValueChange(numericPlayers);
    }
  }, [players, onValueChange, onValidityChange]);

  const getTeamSizeCategory = (count: number): string => {
    if (count <= 15) return "Small Squad";
    if (count <= 30) return "Medium Team";
    if (count <= 50) return "Large Team";
    return "Multi-Team Program";
  };

  const getCostPerPlayer = (count: number, goal: number = 10000): string => {
    if (!count || count === 0) return "N/A";
    return `$${Math.round(goal / count)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Team Size Matters
          </h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground">
          Show sponsors the reach of their investment across your team
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-4">
        <div className="space-y-2">
          <label htmlFor="players" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Total Number of Players
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="players"
              type="text"
              inputMode="numeric"
              value={players}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setPlayers(value);
              }}
              placeholder="Enter number of players"
              className={`pl-10 text-2xl h-14 font-semibold transition-all ${
                error ? "border-destructive" : players ? "border-primary" : ""
              }`}
              autoFocus
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive animate-fade-in">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        {players && !error && parseInt(players) > 0 && (
          <div className="pt-4 border-t border-border space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Team Size:</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-primary">{players}</p>
                <Badge variant="secondary">{getTeamSizeCategory(parseInt(players))}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Cost per player</p>
                <p className="text-lg font-semibold text-foreground">
                  {getCostPerPlayer(parseInt(players))}
                </p>
                <p className="text-xs text-muted-foreground">Based on $10k goal</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Total reach</p>
                <p className="text-lg font-semibold text-primary">
                  {parseInt(players) * 4}+
                </p>
                <p className="text-xs text-muted-foreground">Including families</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 rounded-lg p-3">
              <Award className="w-4 h-4" />
              <span>Every player benefits from sponsorship support!</span>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 bg-secondary/30 border-secondary">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-secondary-foreground flex items-center gap-2">
            💡 Pro Tip
          </p>
          <p className="text-sm text-muted-foreground">
            Include <strong>all team members</strong>: starters, reserves, practice squad, 
            and development players. Sponsors want to see the full impact of their contribution.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SupportedPlayersStep;
