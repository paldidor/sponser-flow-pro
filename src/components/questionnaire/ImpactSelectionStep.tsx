import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImpactSelectionStepProps {
  initialValues?: string[];
  onValueChange: (values: string[]) => void;
  onValidityChange: (isValid: boolean) => void;
}

const predefinedImpacts = [
  "Scholarships",
  "Travel",
  "Equipment",
  "Fields",
  "Player Development",
  "Technology",
];

const ImpactSelectionStep = ({
  initialValues = [],
  onValueChange,
  onValidityChange,
}: ImpactSelectionStepProps) => {
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>(initialValues);
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    const isValid = selectedImpacts.length > 0;
    onValidityChange(isValid);
    onValueChange(selectedImpacts);
  }, [selectedImpacts, onValueChange, onValidityChange]);

  const toggleImpact = (impact: string) => {
    setSelectedImpacts((prev) =>
      prev.includes(impact)
        ? prev.filter((i) => i !== impact)
        : [...prev, impact]
    );
  };

  const addCustomImpact = () => {
    const trimmedInput = customInput.trim();
    if (trimmedInput && !selectedImpacts.includes(trimmedInput)) {
      setSelectedImpacts([...selectedImpacts, trimmedInput]);
      setCustomInput("");
    }
  };

  const removeImpact = (impact: string) => {
    setSelectedImpacts(selectedImpacts.filter((i) => i !== impact));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          What will sponsorship support?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Select all areas where sponsorship funds will make an impact
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {/* Predefined Tags */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Common Impact Areas
          </label>
          <div className="flex flex-wrap gap-2">
            {predefinedImpacts.map((impact) => {
              const isSelected = selectedImpacts.includes(impact);
              return (
                <Badge
                  key={impact}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm hover:scale-105 transition-transform"
                  onClick={() => toggleImpact(impact)}
                >
                  {impact}
                  {isSelected && <X className="w-3 h-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-3">
          <label htmlFor="custom-impact" className="text-sm font-medium text-foreground">
            Add Custom Impact Area
          </label>
          <div className="flex gap-2">
            <Input
              id="custom-impact"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomImpact();
                }
              }}
              placeholder="e.g., Facility Upgrades"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addCustomImpact}
              disabled={!customInput.trim()}
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Selected Impact Tags */}
        {selectedImpacts.length > 0 && (
          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-sm font-medium text-foreground">
              Selected Impact Areas ({selectedImpacts.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedImpacts.map((impact) => (
                <Badge
                  key={impact}
                  variant="secondary"
                  className="px-3 py-1.5"
                >
                  {impact}
                  <button
                    onClick={() => removeImpact(impact)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {selectedImpacts.length === 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Select at least one impact area to continue
          </p>
        </div>
      )}
    </div>
  );
};

export default ImpactSelectionStep;
