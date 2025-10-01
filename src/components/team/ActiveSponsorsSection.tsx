import { Users } from "lucide-react";
import { CollapsibleSection } from "./CollapsibleSection";
import { SponsorCard } from "./SponsorCard";
import { useActiveSponsors } from "@/hooks/useActiveSponsors";

export const ActiveSponsorsSection = () => {
  const { data: sponsors, isLoading, error } = useActiveSponsors();

  if (isLoading) {
    return (
      <CollapsibleSection
        title="Active Sponsors"
        icon={Users}
        badge="Loading..."
        badgeVariant="green"
        borderColor="green"
      >
        <div className="text-center py-8 text-muted-foreground">
          Loading active sponsors...
        </div>
      </CollapsibleSection>
    );
  }

  if (error) {
    return (
      <CollapsibleSection
        title="Active Sponsors"
        icon={Users}
        borderColor="green"
      >
        <div className="text-center py-8 text-destructive">
          Error loading sponsors. Please try again.
        </div>
      </CollapsibleSection>
    );
  }

  const sponsorCount = sponsors?.length || 0;

  return (
    <CollapsibleSection
      title="Active Sponsors"
      icon={Users}
      badge={`${sponsorCount} Sponsor${sponsorCount !== 1 ? 's' : ''}`}
      badgeVariant="green"
      borderColor="green"
    >
      {sponsors && sponsors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sponsor) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No active sponsors yet</p>
          <p className="text-sm text-muted-foreground">
            Sponsors will appear here once you've sold packages
          </p>
        </div>
      )}
    </CollapsibleSection>
  );
};
