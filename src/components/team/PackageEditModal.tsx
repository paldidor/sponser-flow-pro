import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SponsorshipPackage, PlacementOption } from "@/types/dashboard";
import { PlacementSelector } from "@/components/questionnaire/PlacementSelector";
import { DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PackageEditModalProps {
  package: SponsorshipPackage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PackageEditModal = ({ package: pkg, open, onOpenChange }: PackageEditModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"live" | "draft" | "inactive" | "sold-active">("live");
  const [selectedPlacementIds, setSelectedPlacementIds] = useState<string[]>([]);
  const [placements, setPlacements] = useState<PlacementOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPlacementName, setNewPlacementName] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({ popular: true });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (pkg && open) {
      setName(pkg.name);
      setPrice(pkg.price);
      setDescription(pkg.description || "");
      setStatus(pkg.status);
      setSelectedPlacementIds(pkg.placements.map(p => p.id));
      fetchPlacements();
    }
  }, [pkg, open]);

  const fetchPlacements = async () => {
    setLoading(true);
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
      toast.error("Failed to load placement options");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomPlacement = async () => {
    const trimmed = newPlacementName.trim();
    if (!trimmed) return;

    if (placements.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("This placement already exists");
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
      toast.success(`"${trimmed}" added to placement options`);
    } catch (error) {
      console.error("Error adding placement:", error);
      toast.error("Failed to add custom placement");
    }
  };

  const handleTogglePlacement = (placementId: string) => {
    setSelectedPlacementIds(prev =>
      prev.includes(placementId)
        ? prev.filter(id => id !== placementId)
        : [...prev, placementId]
    );
  };

  const handleToggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSave = async () => {
    if (!pkg) return;

    if (!name.trim()) {
      toast.error("Package name is required");
      return;
    }

    if (price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (selectedPlacementIds.length === 0) {
      toast.error("Please select at least one placement");
      return;
    }

    setSaving(true);
    try {
      // Validation: Prevent invalid status transitions
      if (status === "sold-active" && !pkg.sponsor_name) {
        toast.error("Cannot set status to 'Sold' without an active sponsor");
        setSaving(false);
        return;
      }

      // Update package basic info
      const { error: updateError } = await supabase
        .from("sponsorship_packages")
        .update({
          name,
          price,
          description: description || null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pkg.id);

      if (updateError) throw updateError;

      // Get current placements
      const { data: currentPlacements, error: fetchError } = await supabase
        .from("package_placements")
        .select("placement_option_id")
        .eq("package_id", pkg.id);

      if (fetchError) throw fetchError;

      const currentIds = currentPlacements?.map(p => p.placement_option_id) || [];

      // Determine which placements to add and remove
      const toAdd = selectedPlacementIds.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !selectedPlacementIds.includes(id));

      // Remove old placements
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("package_placements")
          .delete()
          .eq("package_id", pkg.id)
          .in("placement_option_id", toRemove);

        if (deleteError) throw deleteError;
      }

      // Add new placements
      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from("package_placements")
          .insert(
            toAdd.map(placementId => ({
              package_id: pkg.id,
              placement_option_id: placementId,
            }))
          );

        if (insertError) throw insertError;
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["sponsorship-offers"] });
      
      toast.success("Package updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("Failed to update package");
    } finally {
      setSaving(false);
    }
  };

  if (!pkg) return null;

  const mockPackage = {
    id: pkg.id,
    name,
    price,
    placementIds: selectedPlacementIds,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Package</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Package Name, Price, and Status */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Package Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Gold Sponsor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-price"
                  type="number"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="1000"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  {pkg?.sponsor_name && (
                    <SelectItem value="sold-active">Sold</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details about this package..."
              rows={3}
            />
          </div>

          {/* Placement Selector */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <PlacementSelector
              pkg={mockPackage}
              placements={placements}
              searchQuery={searchQuery}
              newPlacementName={newPlacementName}
              expandedCategories={expandedCategories}
              onSearchChange={setSearchQuery}
              onNewPlacementChange={setNewPlacementName}
              onAddCustomPlacement={handleAddCustomPlacement}
              onToggleCategory={handleToggleCategory}
              onTogglePlacement={(_, placementId) => handleTogglePlacement(placementId)}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
