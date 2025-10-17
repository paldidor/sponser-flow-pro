import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package, Trash2, DollarSign, CheckCircle2 } from "lucide-react";
import { EnhancedSponsorshipPackage } from "@/types/flow";
import { PlacementOption } from "@/hooks/usePackageBuilder";
import { PlacementSelector } from "./PlacementSelector";

interface PackageCardProps {
  pkg: EnhancedSponsorshipPackage;
  index: number;
  canRemove: boolean;
  placements: PlacementOption[];
  fundraisingGoal?: number;
  totalPrice: number;
  searchQuery: string;
  newPlacementName: string;
  expandedCategories: Record<string, boolean>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof EnhancedSponsorshipPackage, value: any) => void;
  onSearchChange: (value: string) => void;
  onNewPlacementChange: (value: string) => void;
  onAddCustomPlacement: (packageId: string) => void;
  onToggleCategory: (category: string) => void;
  onTogglePlacement: (packageId: string, placementId: string) => void;
}

export const PackageCard = memo(function PackageCard({
  pkg,
  index,
  canRemove,
  placements,
  fundraisingGoal,
  totalPrice,
  searchQuery,
  newPlacementName,
  expandedCategories,
  onRemove,
  onUpdate,
  onSearchChange,
  onNewPlacementChange,
  onAddCustomPlacement,
  onToggleCategory,
  onTogglePlacement,
}: PackageCardProps) {
  // Calculate suggested price based on remaining budget
  const remainingBudget = fundraisingGoal ? fundraisingGoal - totalPrice + (pkg.price || 0) : null;
  const suggestedPrice = remainingBudget && remainingBudget > 0 ? Math.round(remainingBudget / 2) : null;

  return (
    <Card className="p-6 space-y-6">
      {/* Package Info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${pkg.id}`}>Package Name *</Label>
          <Input
            id={`name-${pkg.id}`}
            value={pkg.name}
            onChange={(e) => onUpdate(pkg.id, "name", e.target.value)}
            placeholder="e.g., Gold Sponsor"
            className={pkg.name ? "border-primary" : ""}
          />
          <p className="text-xs text-muted-foreground">
            Suggested: Bronze, Silver, Gold (or tier {index + 1})
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`price-${pkg.id}`}>Price ($) *</Label>
            {suggestedPrice && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => onUpdate(pkg.id, "price", suggestedPrice)}
              >
                Use ${suggestedPrice.toLocaleString()}
              </Button>
            )}
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={`price-${pkg.id}`}
              type="number"
              value={pkg.price || ""}
              onChange={(e) => onUpdate(pkg.id, "price", Number(e.target.value))}
              placeholder="1000"
              className={`pl-9 ${pkg.price > 0 ? "border-primary" : ""}`}
            />
          </div>
          {fundraisingGoal && pkg.price > 0 && (
            <p className="text-xs text-muted-foreground">
              {((pkg.price / fundraisingGoal) * 100).toFixed(0)}% of fundraising goal
            </p>
          )}
        </div>
      </div>

      {/* Placement Selector */}
      <div>
        <Label className="mb-3 block">Select Placements *</Label>
        <PlacementSelector
          pkg={pkg}
          placements={placements}
          searchQuery={searchQuery}
          newPlacementName={newPlacementName}
          expandedCategories={expandedCategories}
          onSearchChange={onSearchChange}
          onNewPlacementChange={onNewPlacementChange}
          onAddCustomPlacement={() => onAddCustomPlacement(pkg.id)}
          onToggleCategory={onToggleCategory}
          onTogglePlacement={onTogglePlacement}
        />
      </div>

      {/* Package Summary */}
      {pkg.name && pkg.price > 0 && pkg.placementIds.length > 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Package Complete</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
            {pkg.placementIds.length} placement{pkg.placementIds.length !== 1 ? 's' : ''} included
          </p>
        </div>
      )}
    </Card>
  );
});
