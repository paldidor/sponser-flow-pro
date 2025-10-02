import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FilterState, SportType, TierType } from "@/types/marketplace";
import { formatCurrency } from "@/lib/marketplaceUtils";

interface FiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const SPORTS: SportType[] = ["Soccer", "Basketball", "Baseball", "Volleyball", "Football", "Hockey", "Other"];
const TIERS: TierType[] = ["Elite", "Premier", "Competitive", "Travel", "Local", "Recreational"];

export const FiltersDrawer = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: FiltersDrawerProps) => {
  const handleSportToggle = (sport: SportType) => {
    const newSports = filters.sports.includes(sport)
      ? filters.sports.filter((s) => s !== sport)
      : [...filters.sports, sport];
    onFiltersChange({ ...filters, sports: newSports });
  };

  const handleTierToggle = (tier: TierType) => {
    const newTiers = filters.tiers.includes(tier)
      ? filters.tiers.filter((t) => t !== tier)
      : [...filters.tiers, tier];
    onFiltersChange({ ...filters, tiers: newTiers });
  };

  const handleClearAll = () => {
    onFiltersChange({
      sports: [],
      location: "",
      tiers: [],
      durationRange: [0, 12],
      priceRange: [0, 5000],
    });
  };

  const activeFiltersCount =
    filters.sports.length +
    filters.tiers.length +
    (filters.location ? 1 : 0) +
    (filters.durationRange[0] > 0 || filters.durationRange[1] < 12 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000 ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Refine your search to find the perfect sponsorship opportunity.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Sports Filter */}
          <div className="space-y-3">
            <Label className="text-[14px] font-semibold text-[#101828]">
              Sports
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {SPORTS.map((sport) => (
                <div key={sport} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sport-${sport}`}
                    checked={filters.sports.includes(sport)}
                    onCheckedChange={() => handleSportToggle(sport)}
                  />
                  <label
                    htmlFor={`sport-${sport}`}
                    className="text-[14px] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {sport}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-3">
            <Label htmlFor="location" className="text-[14px] font-semibold text-[#101828]">
              Location
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="City or State"
              value={filters.location}
              onChange={(e) =>
                onFiltersChange({ ...filters, location: e.target.value })
              }
              className="h-9"
            />
          </div>

          {/* Tiers Filter */}
          <div className="space-y-3">
            <Label className="text-[14px] font-semibold text-[#101828]">
              Competition Level
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {TIERS.map((tier) => (
                <div key={tier} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tier-${tier}`}
                    checked={filters.tiers.includes(tier)}
                    onCheckedChange={() => handleTierToggle(tier)}
                  />
                  <label
                    htmlFor={`tier-${tier}`}
                    className="text-[14px] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tier}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[14px] font-semibold text-[#101828]">
                Duration (months)
              </Label>
              <span className="text-[12px] text-[#6A7282]">
                {filters.durationRange[0]} - {filters.durationRange[1]}mo
              </span>
            </div>
            <Slider
              min={0}
              max={12}
              step={1}
              value={filters.durationRange}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  durationRange: value as [number, number],
                })
              }
              className="py-4"
            />
          </div>

          {/* Price Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[14px] font-semibold text-[#101828]">
                Starting Price
              </Label>
              <span className="text-[12px] text-[#6A7282]">
                {formatCurrency(filters.priceRange[0])} -{" "}
                {formatCurrency(filters.priceRange[1])}
              </span>
            </div>
            <Slider
              min={0}
              max={5000}
              step={100}
              value={filters.priceRange}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  priceRange: value as [number, number],
                })
              }
              className="py-4"
            />
          </div>
        </div>

        <SheetFooter className="flex-row gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="flex-1"
            disabled={activeFiltersCount === 0}
          >
            Clear All
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-[#00AAFE] hover:bg-[#00AAFE]/90"
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
