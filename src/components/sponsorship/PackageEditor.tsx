import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Shirt,
  Building2,
  Smartphone,
  Calendar,
  Star,
  Sparkles,
  DollarSign,
  CheckCircle2,
  Plus,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PlacementOption {
  id: string;
  name: string;
  category: string;
  is_popular: boolean;
  description?: string;
}

interface PackageData {
  id?: string;
  name: string;
  price: number;
  placementIds: string[];
  sponsorship_offer_id?: string;
}

interface PackageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageData?: PackageData | null;
  sponsorshipOfferId: string;
  onSave: () => void;
  mode: "create" | "edit";
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

export const PackageEditor = ({
  open,
  onOpenChange,
  packageData,
  sponsorshipOfferId,
  onSave,
  mode,
}: PackageEditorProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [placementIds, setPlacementIds] = useState<string[]>([]);
  const [placements, setPlacements] = useState<PlacementOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPlacementName, setNewPlacementName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPlacements();
      if (packageData) {
        setName(packageData.name || "");
        setPrice(packageData.price || 0);
        setPlacementIds(packageData.placementIds || []);
      } else {
        // Reset for create mode
        setName("");
        setPrice(0);
        setPlacementIds([]);
      }
    }
  }, [open, packageData]);

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

      if (data?.some((p) => p.is_popular)) {
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

    if (placements.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
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

  const togglePlacement = (placementId: string) => {
    setPlacementIds((prev) =>
      prev.includes(placementId)
        ? prev.filter((id) => id !== placementId)
        : [...prev, placementId]
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Package name is required",
        variant: "destructive",
      });
      return;
    }

    if (price <= 0) {
      toast({
        title: "Validation Error",
        description: "Package price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (placementIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one placement",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      if (mode === "edit" && packageData?.id) {
        // Update existing package
        const { error: updateError } = await supabase
          .from("sponsorship_packages")
          .update({ name, price })
          .eq("id", packageData.id)
          .eq("sponsorship_offer_id", sponsorshipOfferId);

        if (updateError) throw updateError;

        // Delete existing placements
        const { error: deleteError } = await supabase
          .from("package_placements")
          .delete()
          .eq("package_id", packageData.id);

        if (deleteError) throw deleteError;

        // Insert new placements
        const { error: insertError } = await supabase
          .from("package_placements")
          .insert(
            placementIds.map((pid) => ({
              package_id: packageData.id,
              placement_option_id: pid,
            }))
          );

        if (insertError) throw insertError;

        toast({
          title: "Success",
          description: "Package updated successfully",
        });
      } else {
        // Create new package
        const { data: newPackage, error: createError } = await supabase
          .from("sponsorship_packages")
          .insert({
            sponsorship_offer_id: sponsorshipOfferId,
            name,
            price,
            package_order: 999, // Will be reordered on fetch
          })
          .select()
          .single();

        if (createError) throw createError;

        // Insert placements
        const { error: placementsError } = await supabase
          .from("package_placements")
          .insert(
            placementIds.map((pid) => ({
              package_id: newPackage.id,
              placement_option_id: pid,
            }))
          );

        if (placementsError) throw placementsError;

        toast({
          title: "Success",
          description: "Package created successfully",
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving package:", error);
      toast({
        title: "Error",
        description: "Failed to save package",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredPlacements = placements.filter((p) =>
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

  const renderPlacementBadge = (placement: PlacementOption) => {
    const isSelected = placementIds.includes(placement.id);
    return (
      <Badge
        key={placement.id}
        variant={isSelected ? "default" : "outline"}
        className={`cursor-pointer px-3 py-2 transition-all ${
          isSelected
            ? "hover:bg-primary/80 shadow-sm"
            : "hover:scale-105 hover:border-primary/50"
        }`}
        onClick={() => togglePlacement(placement.id)}
      >
        {isSelected && <CheckCircle2 className="w-3 h-3 mr-1" />}
        {placement.name}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Package" : "Create New Package"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the package details and placements"
              : "Create a new sponsorship package with custom placements"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="package-name">Package Name</Label>
                <Input
                  id="package-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Gold Sponsor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-price">Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="package-price"
                    type="number"
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="1000"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Select Placements</Label>
                {placementIds.length > 0 && (
                  <Badge variant="secondary">{placementIds.length} selected</Badge>
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
                  onOpenChange={() => toggleCategory("popular")}
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
                          renderPlacementBadge(placement)
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
                                renderPlacementBadge(placement)
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
                </div>
              </Card>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : mode === "edit" ? "Update Package" : "Create Package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
