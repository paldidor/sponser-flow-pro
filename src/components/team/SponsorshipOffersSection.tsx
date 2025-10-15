import { useState } from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "./CollapsibleSection";
import { OfferCard } from "./OfferCard";
import { OfferEditDialog } from "./OfferEditDialog";
import { OfferDeleteDialog } from "./OfferDeleteDialog";
import { PackageEditModal } from "./PackageEditModal";
import { useSponsorshipOffers } from "@/hooks/useSponsorshipOffers";
import { SponsorshipPackage, SponsorshipOfferWithPackages } from "@/types/dashboard";
import { useNavigate } from "react-router-dom";

export const SponsorshipOffersSection = () => {
  const { data, isLoading, error } = useSponsorshipOffers();
  const navigate = useNavigate();
  const [editingPackage, setEditingPackage] = useState<SponsorshipPackage | null>(null);
  const [creatingPackageForOfferId, setCreatingPackageForOfferId] = useState<string | null>(null);
  const [editingOffer, setEditingOffer] = useState<SponsorshipOfferWithPackages | null>(null);
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);
  const [deletingOfferTitle, setDeletingOfferTitle] = useState("");
  const [deletingOfferPackageCount, setDeletingOfferPackageCount] = useState(0);

  const offers = data?.offers || [];
  const totalPackages = data?.totalPackages || 0;

  const handleAddOffer = () => {
    navigate('/team/create-offer');
  };

  const handleEditOffer = (offer: SponsorshipOfferWithPackages) => {
    setEditingOffer(offer);
  };

  const handleDeleteOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      setDeletingOfferId(offerId);
      setDeletingOfferTitle(offer.title);
      setDeletingOfferPackageCount(offer.package_count);
    }
  };

  const handleAddPackage = (offerId: string) => {
    setCreatingPackageForOfferId(offerId);
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
          Loading sponsorship offers...
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
          Error loading offers. Please try again.
        </div>
      </CollapsibleSection>
    );
  }

  return (
    <>
      <CollapsibleSection
        title="Sponsorship Offers"
        icon={Package}
        badge={`${offers.length} ${offers.length === 1 ? 'offer' : 'offers'} • ${totalPackages} ${totalPackages === 1 ? 'package' : 'packages'}`}
        badgeVariant="blue"
        borderColor="blue"
        actionButton={
          <Button 
            onClick={handleAddOffer}
            className="bg-primary hover:bg-primary/90 text-white h-10 sm:h-9 touch-manipulation"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Add New Sponsorship Offer</span>
            <span className="xs:hidden">Add Offer</span>
          </Button>
        }
      >
        {offers.length > 0 ? (
          <div className="space-y-4">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onEditOffer={handleEditOffer}
                onDeleteOffer={handleDeleteOffer}
                onAddPackage={handleAddPackage}
                onEditPackage={handleEditPackage}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4 px-4">No sponsorship offers yet</p>
            <Button 
              onClick={handleAddOffer} 
              className="bg-primary hover:bg-primary/90 text-white h-11 touch-manipulation"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first offer
            </Button>
          </div>
        )}
      </CollapsibleSection>

      <OfferEditDialog
        offer={editingOffer}
        open={!!editingOffer}
        onOpenChange={(open) => !open && setEditingOffer(null)}
      />

      <OfferDeleteDialog
        offerId={deletingOfferId}
        offerTitle={deletingOfferTitle}
        packageCount={deletingOfferPackageCount}
        open={!!deletingOfferId}
        onOpenChange={(open) => !open && setDeletingOfferId(null)}
      />

      <PackageEditModal
        package={editingPackage}
        offerId={creatingPackageForOfferId}
        open={!!editingPackage || !!creatingPackageForOfferId}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPackage(null);
            setCreatingPackageForOfferId(null);
          }
        }}
      />
    </>
  );
};
