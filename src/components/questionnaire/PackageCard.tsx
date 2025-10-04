import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package, Trash2, DollarSign } from "lucide-react";
import { EnhancedSponsorshipPackage } from "@/types/flow";
import { PlacementOption } from "@/hooks/usePackageBuilder";
import { PlacementSelector } from "./PlacementSelector";

interface PackageCardProps {
  pkg: EnhancedSponsorshipPackage;
  index: number;
  canRemove: boolean;
  placements: PlacementOption[];
  searchQuery: string;
  newPlacementName: string;
  expandedCategories: Record<string, boolean>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof EnhancedSponsorshipPackage, value: any) => void;
  onSearchChange: (value: string) => void;
  onNewPlacementChange: (value: string) => void;
  onAddCustomPlacement: () => void;
  onToggleCategory: (category: string) => void;
  onTogglePlacement: (packageId: string, placementId: string) => void;
}

export function PackageCard({
  pkg,
  index,
  canRemove,
  placements,
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
  return (
    <Card className="p-6 space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Package {index + 1}</h3>
            {pkg.name && (
              <p className="text-sm text-muted-foreground">{pkg.name}</p>
            )}
          </div>
        </div>
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(pkg.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${pkg.id}`}>Package Name</Label>
          <Input
            id={`name-${pkg.id}`}
            value={pkg.name}
            onChange={(e) => onUpdate(pkg.id, "name", e.target.value)}
            placeholder="e.g., Gold Sponsor"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`price-${pkg.id}`}>Price ($)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={`price-${pkg.id}`}
              type="number"
              value={pkg.price || ""}
              onChange={(e) =>
                onUpdate(pkg.id, "price", Number(e.target.value))
              }
              placeholder="1000"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <PlacementSelector
        pkg={pkg}
        placements={placements}
        searchQuery={searchQuery}
        newPlacementName={newPlacementName}
        expandedCategories={expandedCategories}
        onSearchChange={onSearchChange}
        onNewPlacementChange={onNewPlacementChange}
        onAddCustomPlacement={onAddCustomPlacement}
        onToggleCategory={onToggleCategory}
        onTogglePlacement={onTogglePlacement}
      />
    </Card>
  );
}
