import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Plus, Sparkles, CheckCircle2 } from "lucide-react";
import { PlacementOption } from "@/hooks/usePackageBuilder";
import { EnhancedSponsorshipPackage } from "@/types/flow";
import { PlacementCategoryList } from "./PlacementCategoryList";

interface PlacementSelectorProps {
  pkg: EnhancedSponsorshipPackage;
  placements: PlacementOption[];
  searchQuery: string;
  newPlacementName: string;
  expandedCategories: Record<string, boolean>;
  onSearchChange: (value: string) => void;
  onNewPlacementChange: (value: string) => void;
  onAddCustomPlacement: () => void;
  onToggleCategory: (category: string) => void;
  onTogglePlacement: (packageId: string, placementId: string) => void;
}

export function PlacementSelector({
  pkg,
  placements,
  searchQuery,
  newPlacementName,
  expandedCategories,
  onSearchChange,
  onNewPlacementChange,
  onAddCustomPlacement,
  onToggleCategory,
  onTogglePlacement,
}: PlacementSelectorProps) {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <Label className="text-base">Select Placements</Label>
        {pkg.placementIds.length > 0 && (
          <Badge variant="secondary">
            {pkg.placementIds.length} selected
          </Badge>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search placements..."
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category List */}
      <PlacementCategoryList
        placements={placements}
        pkg={pkg}
        expandedCategories={expandedCategories}
        searchQuery={searchQuery}
        onToggleCategory={onToggleCategory}
        onTogglePlacement={onTogglePlacement}
      />

      {/* Add Custom Placement */}
      <Card className="p-4 bg-muted/30">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <Label className="text-sm font-medium">Add Custom Placement</Label>
          </div>
          <div className="flex gap-2">
            <Input
              value={newPlacementName}
              onChange={(e) => onNewPlacementChange(e.target.value)}
              placeholder="e.g., Stadium Scoreboard"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddCustomPlacement();
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={onAddCustomPlacement}
              disabled={!newPlacementName.trim()}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Create unique placement options for your team
          </p>
        </div>
      </Card>

      {/* Selection Status */}
      {pkg.placementIds.length > 0 ? (
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {pkg.placementIds.length} placement
            {pkg.placementIds.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      ) : (
        <div className="p-3 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            👆 Select at least one placement for this package
          </p>
        </div>
      )}
    </div>
  );
}
