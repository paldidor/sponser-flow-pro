import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Package, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { EnhancedSponsorshipPackage } from "@/types/flow";
import { Skeleton } from "@/components/ui/skeleton";
import { usePackageBuilder } from "@/hooks/usePackageBuilder";
import { PackageCard } from "./PackageCard";

interface PackageBuilderStepProps {
  initialPackages?: EnhancedSponsorshipPackage[];
  fundraisingGoal?: number;
  onValueChange: (packages: EnhancedSponsorshipPackage[]) => void;
  onValidityChange: (isValid: boolean) => void;
}

const PackageBuilderStep = ({ initialPackages = [], fundraisingGoal, onValueChange, onValidityChange }: PackageBuilderStepProps) => {
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
    totalPrice,
    remainingBudget,
  } = usePackageBuilder(initialPackages, fundraisingGoal, onValueChange, onValidityChange);

  const [activeTab, setActiveTab] = useState(packages[0]?.id || "");

  // Update active tab when packages change
  if (packages.length > 0 && !packages.find(p => p.id === activeTab)) {
    setActiveTab(packages[0].id);
  }

  const handleAddPackage = () => {
    const newId = addPackage();
    setActiveTab(newId);
  };

  const handleRemovePackage = (id: string) => {
    const currentIndex = packages.findIndex(p => p.id === id);
    removePackage(id);
    
    // Switch to another tab after deletion
    if (packages.length > 1) {
      const nextPackage = packages[currentIndex + 1] || packages[currentIndex - 1];
      if (nextPackage) {
        setActiveTab(nextPackage.id);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Build Sponsorship Packages</h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground">
          Create pricing tiers with different placement options for sponsors
        </p>
      </div>

      {/* Budget Tracker */}
      {fundraisingGoal && (
        <Card className={`p-4 border-2 ${
          Math.abs(totalPrice - fundraisingGoal) < 1 
            ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
            : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
        }`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground">Total Package Value</p>
              <p className="text-2xl font-bold text-foreground">${totalPrice.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Fundraising Goal</p>
              <p className="text-2xl font-bold text-foreground">${fundraisingGoal.toLocaleString()}</p>
            </div>
          </div>
          {remainingBudget !== null && Math.abs(remainingBudget) > 1 && (
            <div className={`mt-3 flex items-start gap-2 text-sm ${
              remainingBudget > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'
            }`}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                {remainingBudget > 0 
                  ? `${((remainingBudget / fundraisingGoal) * 100).toFixed(0)}% unallocated ($${remainingBudget.toLocaleString()} remaining)`
                  : `Exceeds goal by $${Math.abs(remainingBudget).toLocaleString()}`
                }
              </p>
            </div>
          )}
          {remainingBudget !== null && Math.abs(remainingBudget) < 1 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <p className="font-medium">Perfect! Packages match your fundraising goal</p>
            </div>
          )}
        </Card>
      )}

      {loading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex h-auto p-1 bg-muted min-w-max">
              {packages.map((pkg, index) => (
                <TabsTrigger
                  key={pkg.id}
                  value={pkg.id}
                  className="relative px-4 py-2.5 min-w-[140px] data-[state=active]:bg-background touch-manipulation"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Package className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium truncate">
                      {pkg.name || `Package ${index + 1}`}
                    </span>
                    {pkg.price > 0 && (
                      <Badge variant="secondary" className="ml-1 flex-shrink-0">
                        ${(pkg.price / 1000).toFixed(0)}k
                      </Badge>
                    )}
                  </div>
                  {packages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePackage(pkg.id);
                      }}
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* Add Package Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddPackage}
              className="flex-shrink-0 h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          </div>

          {/* Tab Contents */}
          {packages.map((pkg, index) => (
            <TabsContent key={pkg.id} value={pkg.id} className="mt-4">
              <PackageCard
                pkg={pkg}
                index={index}
                canRemove={packages.length > 1}
                placements={placements}
                fundraisingGoal={fundraisingGoal}
                totalPrice={totalPrice}
                searchQuery={searchQuery}
                newPlacementName={newPlacementName}
                expandedCategories={expandedCategories}
                onRemove={handleRemovePackage}
                onUpdate={updatePackage}
                onSearchChange={setSearchQuery}
                onNewPlacementChange={setNewPlacementName}
                onAddCustomPlacement={addCustomPlacement}
                onToggleCategory={toggleCategory}
                onTogglePlacement={togglePlacement}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Tips Section */}
      <Card className="p-4 bg-secondary/30 border-secondary">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-secondary-foreground">💡 Package Tips</p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
            <li><strong>Pricing Strategy:</strong> Ensure total package value equals your fundraising goal</li>
            <li><strong>Tier Naming:</strong> Bronze/Silver/Gold works well for differentiation</li>
            <li><strong>Placement Mix:</strong> Higher tiers should include more visible placements</li>
            <li><strong>Popular First:</strong> Uniforms and signage attract premium sponsors</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default PackageBuilderStep;
