import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FiltersButtonProps {
  onClick: () => void;
  activeFiltersCount?: number;
}

export const FiltersButton = ({ onClick, activeFiltersCount = 0 }: FiltersButtonProps) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="relative h-11 min-h-[44px] min-w-[98px] gap-2 rounded-lg border-black/10 bg-white text-[14px] font-medium text-[#0A0A0A] hover:bg-gray-50 active:scale-95"
    >
      <SlidersHorizontal className="h-4 w-4" />
      <span>Filters</span>
      {activeFiltersCount > 0 && (
        <Badge
          variant="secondary"
          className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-[#00AAFE] p-0 text-[10px] font-semibold text-white"
        >
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  );
};
