import { Edit, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SponsorshipPackage } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface SponsorshipCardProps {
  package: SponsorshipPackage;
  onEdit?: (pkg: SponsorshipPackage) => void;
}

export const SponsorshipCard = ({ package: pkg, onEdit }: SponsorshipCardProps) => {
  const statusConfig = {
    "sold-active": { label: "Sold - Active", color: "bg-dashboard-green text-white" },
    live: { label: "Live", color: "bg-primary text-white" },
    draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
    inactive: { label: "Inactive", color: "bg-destructive text-white" },
  };

  const status = statusConfig[pkg.status];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Display all placements (up to 5)
  const displayPlacements = pkg.placements.slice(0, 5);

  return (
    <Card className="w-[264px] flex-shrink-0 overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg bg-gradient-to-br from-white to-primary/5">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <Badge className={cn("font-medium", status.color)}>
          {status.label}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
          onClick={() => onEdit?.(pkg)}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit package</span>
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Package Name */}
        <h4 className="font-semibold text-lg text-foreground">{pkg.name}</h4>

        {/* Price Box */}
        <div className="bg-primary text-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{formatPrice(pkg.price)}</div>
          <div className="text-xs text-white/80 mt-1">Package Value</div>
        </div>

        {/* What's Included */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-3 tracking-wide">
            WHAT'S INCLUDED
          </div>
          <div className="space-y-2">
            {displayPlacements.map((placement) => (
              <div key={placement.id} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{placement.name}</span>
              </div>
            ))}
            {pkg.placements.length > 5 && (
              <div className="text-xs text-muted-foreground mt-1">
                +{pkg.placements.length - 5} more benefits
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-muted/30 border-t space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium text-foreground">{pkg.duration}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sponsor</span>
          <span className="font-medium text-foreground">{pkg.sponsor_name || "-"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Open Tasks</span>
          {pkg.open_tasks ? (
            <Badge variant="secondary" className="bg-dashboard-orange text-white">
              {pkg.open_tasks}
            </Badge>
          ) : (
            <span className="font-medium text-foreground">-</span>
          )}
        </div>
      </div>
    </Card>
  );
};
