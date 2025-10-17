import { useState, useEffect } from "react";
import { EnhancedSponsorshipPackage } from "@/types/flow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PlacementOption {
  id: string;
  name: string;
  category: string;
  is_popular: boolean;
  description?: string;
}

export function usePackageBuilder(
  initialPackages: EnhancedSponsorshipPackage[],
  fundraisingGoal: number | undefined,
  onValueChange: (packages: EnhancedSponsorshipPackage[]) => void,
  onValidityChange: (isValid: boolean) => void
) {
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

  // Calculate total package prices and remaining budget
  const totalPrice = packages.reduce((sum, pkg) => sum + (pkg.price || 0), 0);
  const remainingBudget = fundraisingGoal ? fundraisingGoal - totalPrice : null;

  useEffect(() => {
    const isValid = packages.every(
      (pkg) => pkg.name.trim() !== "" && pkg.price > 0 && pkg.placementIds.length > 0
    );
    
    // If fundraising goal exists, check if total matches (within $1 tolerance)
    const matchesBudget = !fundraisingGoal || Math.abs(totalPrice - fundraisingGoal) < 1;
    
    onValidityChange(isValid && matchesBudget);
    onValueChange(packages);
  }, [packages, fundraisingGoal, totalPrice, onValueChange, onValidityChange]);

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

  const addCustomPlacement = async (packageId?: string) => {
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
      
      // Auto-select for the current package if packageId provided
      if (packageId) {
        setPackages((prevPackages) =>
          prevPackages.map((pkg) =>
            pkg.id === packageId
              ? { ...pkg, placementIds: [...pkg.placementIds, data.id] }
              : pkg
          )
        );
      }
      
      setNewPlacementName("");
      
      // Expand custom category to show new placement
      setExpandedCategories((prev) => ({ ...prev, custom: true }));
      
      toast({
        title: "Success",
        description: `"${trimmed}" added and selected`,
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
    const newId = Date.now().toString();
    setPackages([
      ...packages,
      {
        id: newId,
        name: "",
        price: 0,
        placementIds: [],
      },
    ]);
    return newId;
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

  return {
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
  };
}
