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

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search placements..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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

      {/* Placement categories */}
      <PlacementCategoryList
        placements={placements}
        pkg={pkg}
        expandedCategories={expandedCategories}
        searchQuery={searchQuery}
        onToggleCategory={onToggleCategory}
        onTogglePlacement={onTogglePlacement}
      />

      {/* Custom placement creation - MOVED TO BOTTOM */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Add Custom Placement</p>
          </div>
          <div className="flex gap-2">
            <Input
              value={newPlacementName}
              onChange={(e) => onNewPlacementChange(e.target.value)}
              placeholder="e.g., Team Bus Logo"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddCustomPlacement();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={onAddCustomPlacement}
              disabled={!newPlacementName.trim()}
              size="sm"
              className="flex-shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Create a unique placement option for your sponsorships
          </p>
        </div>
      </Card>

      {/* Selection status */}
      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
        <p className="text-sm font-medium text-foreground">
          {pkg.placementIds.length === 0 ? (
            "No placements selected"
          ) : (
            <>
              <span className="text-primary font-bold">{pkg.placementIds.length}</span> placement
              {pkg.placementIds.length !== 1 ? "s" : ""} selected
            </>
          )}
        </p>
        {pkg.placementIds.length > 0 && (
          <Badge variant="secondary">{pkg.placementIds.length}</Badge>
        )}
      </div>
    </div>
  );
}
