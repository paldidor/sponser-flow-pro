import { MapPin, Users, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpportunityCardProps } from "@/types/marketplace";
import { formatCurrency, formatDuration, formatLocation } from "@/lib/marketplaceUtils";
import { Tag } from "./Tag";
import { StatTile } from "./StatTile";
import { ProgressBar } from "./ProgressBar";
import calendarIcon from "@/assets/icons/calendar-stat.svg";
import usersIcon from "@/assets/icons/users-stat.svg";
import targetIcon from "@/assets/icons/target-stat.svg";
import { cn } from "@/lib/utils";

export const OpportunityCard = ({
  opportunity,
  onSave,
  onClick,
}: OpportunityCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking bookmark or CTA
    if (
      (e.target as HTMLElement).closest("button") &&
      !(e.target as HTMLElement).closest("[data-card-cta]")
    ) {
      return;
    }
    onClick(opportunity.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(opportunity.id);
  };

  return (
    <article
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white transition-shadow hover:shadow-lg"
      onClick={handleClick}
    >
      {/* Hero Section */}
      <div className="relative h-[128px] w-full">
        <img
          src={opportunity.imageUrl}
          alt={opportunity.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Sport Pill */}
        <span className="absolute left-3 top-3 rounded-full bg-[#FFB82D] px-3 py-1 text-[12px] font-medium leading-4 text-black">
          {opportunity.sport}
        </span>

        {/* Bookmark Button - Enhanced for mobile touch */}
        <button
          onClick={handleBookmark}
          className={cn(
            "absolute right-3 top-3 grid min-h-[44px] min-w-[44px] place-items-center rounded-full bg-black/20 p-2 transition-colors hover:bg-black/40 active:scale-95",
            opportunity.saved && "bg-[#00AAFE] hover:bg-[#00AAFE]/90"
          )}
          aria-label={opportunity.saved ? "Remove bookmark" : "Save opportunity"}
        >
          <Bookmark
            className={cn(
              "h-5 w-5 stroke-white",
              opportunity.saved && "fill-white"
            )}
          />
        </button>

        {/* Hero Text Stack */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-0.5">
          <h3 className="line-clamp-1 text-[18px] font-bold leading-[22.5px] text-white drop-shadow-md">
            {opportunity.title}
          </h3>
          <p className="line-clamp-1 text-[12px] leading-[15px] text-[#E5E7EB]">
            {opportunity.organization}
          </p>
          <p className="line-clamp-1 text-[12px] font-medium leading-[15px] text-white">
            {opportunity.team}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-3 text-[12px] leading-4 text-[#4A5565]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {formatLocation(opportunity.city, opportunity.state)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {opportunity.players} players
          </span>
          <Tag label={opportunity.tier} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatTile
            icon={targetIcon}
            value={opportunity.packagesCount}
            label="Packages"
          />
          <StatTile
            icon={usersIcon}
            value={opportunity.estWeekly.toLocaleString()}
            label="Est. Weekly"
          />
          <StatTile
            icon={calendarIcon}
            value={formatDuration(opportunity.durationMonths)}
            label="Duration"
          />
        </div>

        {/* Progress Bar */}
        <ProgressBar raised={opportunity.raised} goal={opportunity.goal} />

        {/* Footer: Price & CTA */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-[12px] text-[#6A7282]">Starting at</span>
            <span className="text-[18px] font-bold leading-7 text-[#00AAFE]">
              {formatCurrency(opportunity.startingAt)}
            </span>
          </div>
          <Button
            data-card-cta
            onClick={handleClick}
            className="h-11 min-h-[44px] rounded-[10px] bg-[#00AAFE] px-4 text-[14px] font-medium text-white hover:bg-[#00AAFE]/90 active:scale-95"
          >
            View Details
          </Button>
        </div>
      </div>
    </article>
  );
};
