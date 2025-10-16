import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { EnhancedSponsorshipPackage } from "@/types/flow";
import { Skeleton } from "@/components/ui/skeleton";
import { usePackageBuilder } from "@/hooks/usePackageBuilder";
import { PackageCard } from "./PackageCard";

interface PackageBuilderStepProps {
  initialPackages?: EnhancedSponsorshipPackage[];
  onValueChange: (packages: EnhancedSponsorshipPackage[]) => void;
  onValidityChange: (isValid: boolean) => void;
}

const PackageBuilderStep = ({ initialPackages = [], onValueChange, onValidityChange }: PackageBuilderStepProps) => {
  const {
    packages,
    placements,
    loading,
    newPlacementName,
    setNewPlacementName,
    searchQuery,
    setSearchQuery,
    expandedCategories,
    addCustomPlacement,
    addPackage,
    removePackage,
    updatePackage,
    togglePlacement,
    toggleCategory,
  } = usePackageBuilder(initialPackages, onValueChange, onValidityChange);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Build Sponsorship Packages</h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground">
          Choose available placements where sponsors can appear — on uniforms, signs, banners, or digital placements
        </p>
      </div>

      {loading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </Card>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg, index) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={index}
              canRemove={packages.length > 1}
              placements={placements}
              searchQuery={searchQuery}
              newPlacementName={newPlacementName}
              expandedCategories={expandedCategories}
              onRemove={removePackage}
              onUpdate={updatePackage}
              onSearchChange={setSearchQuery}
              onNewPlacementChange={setNewPlacementName}
              onAddCustomPlacement={addCustomPlacement}
              onToggleCategory={toggleCategory}
              onTogglePlacement={togglePlacement}
            />
          ))}

          <Button onClick={addPackage} variant="outline" className="w-full h-12">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Package
          </Button>
        </div>
      )}

      {/* Tips Section */}
      <Card className="p-4 bg-secondary/30 border-secondary">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-secondary-foreground flex items-center gap-2">💡 Package Tips</p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
            <li>
              <strong>Bronze/Silver/Gold</strong> tiers work well for most teams
            </li>
            <li>
              Higher tiers should include <strong>more visible placements</strong>
            </li>
            <li>Popular placements like uniforms attract premium sponsors</li>
            <li>Mix physical and digital placements for broader appeal</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default PackageBuilderStep;
