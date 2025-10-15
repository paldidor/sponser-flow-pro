import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SponsorshipCard } from "./SponsorshipCard";
import { SponsorshipOfferWithPackages, SponsorshipPackage } from "@/types/dashboard";

interface OfferCardProps {
  offer: SponsorshipOfferWithPackages;
  onEditOffer: (offer: SponsorshipOfferWithPackages) => void;
  onDeleteOffer: (offerId: string) => void;
  onAddPackage: (offerId: string) => void;
  onEditPackage: (pkg: SponsorshipPackage) => void;
}

export const OfferCard = ({
  offer,
  onEditOffer,
  onDeleteOffer,
  onAddPackage,
  onEditPackage,
}: OfferCardProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Calculate metrics
  const totalValue = offer.packages.reduce((sum, pkg) => sum + Number(pkg.price), 0);
  const livePackagesCount = offer.packages.filter(pkg => pkg.status === "live").length;

  return (
    <Card className="border border-[#00aafe]/30 hover:bg-[#00aafe]/5 transition-colors duration-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Top row: Chevron + Title + Metrics */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent shrink-0">
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#00aafe]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#00aafe]" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                  <h3 className="text-lg font-semibold text-foreground truncate font-['Poppins']">
                    {offer.title}
                  </h3>
                  
                  {/* Metrics Badge - Always visible */}
                  <Badge 
                    variant="secondary" 
                    className="bg-[#00aafe]/10 text-[#00aafe] border-[#00aafe]/30 text-xs font-medium whitespace-nowrap"
                  >
                    ${totalValue.toLocaleString()} • {livePackagesCount} live
                  </Badge>
                </div>
                
                {offer.description && (
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {offer.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons - Right side on desktop, below on mobile */}
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditOffer(offer)}
                className="h-9 px-3"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteOffer(offer.id)}
                className="h-9 px-3 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => onAddPackage(offer.id)}
                variant="outline"
                size="sm"
                className="border-[#00aafe] text-[#00aafe] hover:bg-[#00aafe]/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </div>

            {offer.packages.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2">
                <div className="flex gap-3 sm:gap-4 min-w-min">
                  {offer.packages.map((pkg) => (
                    <SponsorshipCard
                      key={pkg.id}
                      package={pkg}
                      onEdit={onEditPackage}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                <p className="text-sm">No packages in this offer yet. Add your first package!</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
