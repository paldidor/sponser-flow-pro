import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Package, DollarSign } from "lucide-react";
import { EnhancedSponsorshipPackage } from "@/types/flow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PlacementOption {
  id: string;
  name: string;
  category: string;
  is_popular: boolean;
}

interface PackageBuilderStepProps {
  initialPackages?: EnhancedSponsorshipPackage[];
  onValueChange: (packages: EnhancedSponsorshipPackage[]) => void;
  onValidityChange: (isValid: boolean) => void;
}

const PackageBuilderStep = ({
  initialPackages = [],
  onValueChange,
  onValidityChange,
}: PackageBuilderStepProps) => {
  const [packages, setPackages] = useState<EnhancedSponsorshipPackage[]>(
    initialPackages.length > 0
      ? initialPackages
      : [{ id: "1", name: "", price: 0, placementIds: [] }]
  );
  const [placements, setPlacements] = useState<PlacementOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlacementName, setNewPlacementName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPlacements();
  }, []);

  useEffect(() => {
    const isValid = packages.every(
      (pkg) => pkg.name.trim() !== "" && pkg.price > 0 && pkg.placementIds.length > 0
    );
    onValidityChange(isValid);
    onValueChange(packages);
  }, [packages, onValueChange, onValidityChange]);

  const fetchPlacements = async () => {
    try {
      const { data, error } = await supabase
        .from("placement_options")
        .select("*")
        .order("is_popular", { ascending: false })
        .order("category")
        .order("name");

      if (error) throw error;
      setPlacements(data || []);
    } catch (error) {
      console.error("Error fetching placements:", error);
      toast({
        title: "Error",
        description: "Failed to load placement options",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomPlacement = async () => {
    const trimmed = newPlacementName.trim();
    if (!trimmed) return;

    try {
      const { data, error } = await supabase
        .from("placement_options")
        .insert({ name: trimmed, category: "custom", is_popular: false })
        .select()
        .single();

      if (error) throw error;

      setPlacements([...placements, data]);
      setNewPlacementName("");
      toast({
        title: "Success",
        description: "Custom placement added",
      });
    } catch (error) {
      console.error("Error adding placement:", error);
      toast({
        title: "Error",
        description: "Failed to add custom placement",
        variant: "destructive",
      });
    }
  };

  const addPackage = () => {
    setPackages([
      ...packages,
      {
        id: Date.now().toString(),
        name: "",
        price: 0,
        placementIds: [],
      },
    ]);
  };

  const removePackage = (id: string) => {
    if (packages.length > 1) {
      setPackages(packages.filter((pkg) => pkg.id !== id));
    }
  };

  const updatePackage = (
    id: string,
    field: keyof EnhancedSponsorshipPackage,
    value: any
  ) => {
    setPackages(
      packages.map((pkg) => (pkg.id === id ? { ...pkg, [field]: value } : pkg))
    );
  };

  const togglePlacement = (packageId: string, placementId: string) => {
    setPackages(
      packages.map((pkg) =>
        pkg.id === packageId
          ? {
              ...pkg,
              placementIds: pkg.placementIds.includes(placementId)
                ? pkg.placementIds.filter((id) => id !== placementId)
                : [...pkg.placementIds, placementId],
            }
          : pkg
      )
    );
  };

  const popularPlacements = placements.filter((p) => p.is_popular);
  const categorizedPlacements = placements.reduce((acc, placement) => {
    if (!placement.is_popular) {
      if (!acc[placement.category]) {
        acc[placement.category] = [];
      }
      acc[placement.category].push(placement);
    }
    return acc;
  }, {} as Record<string, PlacementOption[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Create your packages
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Build sponsorship packages with names, prices, and placements
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
            <Card key={pkg.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Package {index + 1}</h3>
                </div>
                {packages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePackage(pkg.id)}
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
                    onChange={(e) => updatePackage(pkg.id, "name", e.target.value)}
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
                        updatePackage(pkg.id, "price", Number(e.target.value))
                      }
                      placeholder="1000"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Select Placements</Label>

                {/* Popular Placements */}
                {popularPlacements.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Popular
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularPlacements.map((placement) => {
                        const isSelected = pkg.placementIds.includes(placement.id);
                        return (
                          <Badge
                            key={placement.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer px-3 py-1.5 hover:scale-105 transition-transform"
                            onClick={() => togglePlacement(pkg.id, placement.id)}
                          >
                            {placement.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Categorized Placements */}
                {Object.entries(categorizedPlacements).map(
                  ([category, categoryPlacements]) => (
                    <div key={category} className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {categoryPlacements.map((placement) => {
                          const isSelected = pkg.placementIds.includes(
                            placement.id
                          );
                          return (
                            <Badge
                              key={placement.id}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer px-3 py-1.5 hover:scale-105 transition-transform"
                              onClick={() =>
                                togglePlacement(pkg.id, placement.id)
                              }
                            >
                              {placement.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}

                {/* Add Custom Placement */}
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Add Custom
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={newPlacementName}
                      onChange={(e) => setNewPlacementName(e.target.value)}
                      placeholder="Custom placement name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomPlacement();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addCustomPlacement}
                      disabled={!newPlacementName.trim()}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {pkg.placementIds.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {pkg.placementIds.length} placement
                    {pkg.placementIds.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </Card>
          ))}

          <Button onClick={addPackage} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Package
          </Button>
        </div>
      )}
    </div>
  );
};

export default PackageBuilderStep;
