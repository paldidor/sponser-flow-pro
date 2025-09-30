import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Package, 
  DollarSign, 
  CheckCircle2, 
  Search, 
  X,
  ChevronDown,
  ChevronUp,
  Shirt,
  Building2,
  Smartphone,
  Calendar,
  Star,
  Sparkles
} from "lucide-react";
import { EnhancedSponsorshipPackage } from "@/types/flow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PlacementOption {
  id: string;
  name: string;
  category: string;
  is_popular: boolean;
  description?: string;
}

interface PackageBuilderStepProps {
  initialPackages?: EnhancedSponsorshipPackage[];
  onValueChange: (packages: EnhancedSponsorshipPackage[]) => void;
  onValidityChange: (isValid: boolean) => void;
}

const categoryIcons: Record<string, any> = {
  uniform: Shirt,
  facility: Building2,
  digital: Smartphone,
  events: Calendar,
  custom: Sparkles,
  general: Star,
};

const categoryLabels: Record<string, string> = {
  uniform: "Uniform & Apparel",
  facility: "Facility & Venue",
  digital: "Digital & Online",
  events: "Events & Programs",
  custom: "Custom Placements",
  general: "General",
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
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
      
      // Auto-expand popular if there are popular placements
      if (data?.some(p => p.is_popular)) {
        setExpandedCategories({ popular: true });
      }
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

    // Check for duplicates
    if (placements.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      toast({
        title: "Duplicate",
        description: "This placement already exists",
        variant: "destructive",
      });
      return;
    }

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
        description: `"${trimmed}" added to placement options`,
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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Filter placements by search
  const filteredPlacements = placements.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularPlacements = filteredPlacements.filter((p) => p.is_popular);
  const categorizedPlacements = filteredPlacements.reduce((acc, placement) => {
    if (!placement.is_popular) {
      if (!acc[placement.category]) {
        acc[placement.category] = [];
      }
      acc[placement.category].push(placement);
    }
    return acc;
  }, {} as Record<string, PlacementOption[]>);

  const renderPlacementBadge = (placement: PlacementOption, pkg: EnhancedSponsorshipPackage) => {
    const isSelected = pkg.placementIds.includes(placement.id);
    return (
      <Badge
        key={placement.id}
        variant={isSelected ? "default" : "outline"}
        className={`cursor-pointer px-3 py-2 transition-all ${
          isSelected
            ? "hover:bg-primary/80 shadow-sm"
            : "hover:scale-105 hover:border-primary/50"
        }`}
        onClick={() => togglePlacement(pkg.id, placement.id)}
      >
        {isSelected && <CheckCircle2 className="w-3 h-3 mr-1" />}
        {placement.name}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Build Your Packages
          </h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground">
          Create tiered sponsorship options with specific benefits and visibility placements
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
            <Card key={pkg.id} className="p-6 space-y-4 hover:shadow-md transition-shadow">
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
                {packages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePackage(pkg.id)}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search placements..."
                    className="pl-9 pr-9"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Popular Placements */}
                {popularPlacements.length > 0 && (
                  <Collapsible
                    open={expandedCategories.popular !== false}
                    onOpenChange={() => toggleCategory('popular')}
                  >
                    <Card className="border-primary/20 bg-primary/5">
                      <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-primary/10 transition-colors">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">
                            Popular Placements
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {popularPlacements.length}
                          </Badge>
                        </div>
                        {expandedCategories.popular !== false ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 pt-0">
                        <div className="flex flex-wrap gap-2">
                          {popularPlacements.map((placement) =>
                            renderPlacementBadge(placement, pkg)
                          )}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}

                {/* Categorized Placements */}
                <div className="space-y-2">
                  {Object.entries(categorizedPlacements)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([category, categoryPlacements]) => {
                      const Icon = categoryIcons[category] || Star;
                      const label = categoryLabels[category] || category;
                      
                      return (
                        <Collapsible
                          key={category}
                          open={expandedCategories[category]}
                          onOpenChange={() => toggleCategory(category)}
                        >
                          <Card className="border-border/50">
                            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-accent transition-colors">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium text-sm text-foreground">
                                  {label}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {categoryPlacements.length}
                                </Badge>
                              </div>
                              {expandedCategories[category] ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-3 pt-0">
                              <div className="flex flex-wrap gap-2">
                                {categoryPlacements.map((placement) =>
                                  renderPlacementBadge(placement, pkg)
                                )}
                              </div>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      );
                    })}
                </div>

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
                        onChange={(e) => setNewPlacementName(e.target.value)}
                        placeholder="e.g., Stadium Scoreboard"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomPlacement();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addCustomPlacement}
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
            </Card>
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
          <p className="text-sm font-semibold text-secondary-foreground flex items-center gap-2">
            💡 Package Tips
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
            <li><strong>Bronze/Silver/Gold</strong> tiers work well for most teams</li>
            <li>Higher tiers should include <strong>more visible placements</strong></li>
            <li>Popular placements like uniforms attract premium sponsors</li>
            <li>Mix physical and digital placements for broader appeal</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default PackageBuilderStep;
