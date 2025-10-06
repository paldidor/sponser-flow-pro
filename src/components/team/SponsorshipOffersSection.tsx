import { useState } from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "./CollapsibleSection";
import { SponsorshipCard } from "./SponsorshipCard";
import { PackageEditModal } from "./PackageEditModal";
import { useSponsorshipOffers } from "@/hooks/useSponsorshipOffers";
import { SponsorshipPackage } from "@/types/dashboard";
import { useNavigate } from "react-router-dom";

export const SponsorshipOffersSection = () => {
  const { data: packages, isLoading, error } = useSponsorshipOffers();
  const navigate = useNavigate();
  const [editingPackage, setEditingPackage] = useState<SponsorshipPackage | null>(null);

  const handleAddPackage = () => {
    navigate("/team/create-offer");
  };

  const handleEditPackage = (pkg: SponsorshipPackage) => {
    setEditingPackage(pkg);
  };

  if (isLoading) {
    return (
      <CollapsibleSection
        title="Sponsorship Offers"
        icon={Package}
        badge="Loading..."
        badgeVariant="blue"
        borderColor="blue"
      >
        <div className="text-center py-8 text-muted-foreground">
          Loading sponsorship packages...
        </div>
      </CollapsibleSection>
    );
  }

  if (error) {
    return (
      <CollapsibleSection
        title="Sponsorship Offers"
        icon={Package}
        borderColor="blue"
      >
        <div className="text-center py-8 text-destructive">
          Error loading packages. Please try again.
        </div>
      </CollapsibleSection>
    );
  }

  const activeCount = packages?.filter(p => p.status !== "inactive").length || 0;

  return (
    <>
      <CollapsibleSection
        title="Sponsorship Offers"
        icon={Package}
        badge={`${activeCount} Active`}
        badgeVariant="blue"
        borderColor="blue"
        actionButton={
          <Button 
            onClick={handleAddPackage}
            className="bg-primary hover:bg-primary/90 text-white h-10 sm:h-9 touch-manipulation"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Add new Package</span>
            <span className="xs:hidden">Add</span>
          </Button>
        }
      >
        {packages && packages.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2">
            <div className="flex gap-3 sm:gap-4 min-w-min">
              {packages.map((pkg) => (
                <SponsorshipCard
                  key={pkg.id}
                  package={pkg}
                  onEdit={handleEditPackage}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4 px-4">No sponsorship packages yet</p>
            <Button 
              onClick={handleAddPackage} 
              className="bg-primary hover:bg-primary/90 text-white h-11 touch-manipulation"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first package
            </Button>
          </div>
        )}
      </CollapsibleSection>

      <PackageEditModal
        package={editingPackage}
        open={!!editingPackage}
        onOpenChange={(open) => !open && setEditingPackage(null)}
      />
    </>
  );
};
