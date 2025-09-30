import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          How many players will benefit?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Tell sponsors how many athletes your team supports
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-4">
        <div className="space-y-2">
          <label htmlFor="players" className="text-sm font-medium text-foreground">
            Number of Players
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
              placeholder="25"
              className="pl-10 text-2xl h-14 font-semibold"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        {players && !error && (
          <div className="pt-4 border-t border-border space-y-2">
            <p className="text-sm text-muted-foreground">
              Supporting: <span className="font-semibold text-foreground">{players} players</span>
            </p>
          </div>
        )}
      </Card>

      <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-secondary-foreground">💡 Tip</p>
        <p className="text-sm text-muted-foreground">
          Include all team members who will benefit from sponsorship funds, including reserves and practice squad.
        </p>
      </div>
    </div>
  );
};

export default SupportedPlayersStep;
