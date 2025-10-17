import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Star, Shirt, Building2, Smartphone, Calendar, Sparkles, Plus } from "lucide-react";
import { PlacementOption } from "@/hooks/usePackageBuilder";
import { EnhancedSponsorshipPackage } from "@/types/flow";

interface PlacementCategoryListProps {
  placements: PlacementOption[];
  pkg: EnhancedSponsorshipPackage;
  expandedCategories: Record<string, boolean>;
  searchQuery: string;
  onToggleCategory: (category: string) => void;
  onTogglePlacement: (packageId: string, placementId: string) => void;
}

// Define explicit category order
const CATEGORY_ORDER = [
  'popular',      // Always first (if exists)
  'recommended',  // AI-recommended placements
  'uniform',      // Uniform & Apparel
  'facility',     // Facility & Venue
  'digital',      // Digital & Online
  'events',       // Events & Programs
  'custom',       // Custom Placements (always last)
];

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  recommended: Sparkles,
  uniform: Shirt,
  facility: Building2,
  digital: Smartphone,
  events: Calendar,
  custom: Plus,
  general: Star,
};

// Category display names
const categoryLabels: Record<string, string> = {
  recommended: "Recommended for You",
  uniform: "Uniform & Apparel",
  facility: "Facility & Venue",
  digital: "Digital & Online",
  events: "Events & Programs",
  custom: "Custom Placements",
  general: "General",
};

export function PlacementCategoryList({
  placements,
  pkg,
  expandedCategories,
  searchQuery,
  onToggleCategory,
  onTogglePlacement,
}: PlacementCategoryListProps) {
  // Filter placements by search
  const filteredPlacements = placements.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularPlacements = filteredPlacements.filter((p) => p.is_popular);
  const categorizedPlacements = filteredPlacements.reduce((acc, placement) => {
    if (!placement.is_popular) {
      if (!acc[placement.category]) {
        acc[placement.category] = [];
      }
      acc[placement.category].push(placement);
    }
    return acc;
  }, {} as Record<string, PlacementOption[]>);

  // Sort categories by predefined order
  const sortedCategories = Object.entries(categorizedPlacements).sort(([a], [b]) => {
    const aIndex = CATEGORY_ORDER.indexOf(a);
    const bIndex = CATEGORY_ORDER.indexOf(b);
    
    // If not in order array, push to end
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });

  const renderPlacementBadge = (placement: PlacementOption) => {
    const isSelected = pkg.placementIds.includes(placement.id);
    return (
      <Badge
        key={placement.id}
        variant={isSelected ? "default" : "outline"}
        className={`cursor-pointer px-3 py-2 transition-all ${
          isSelected
            ? "hover:bg-primary/80 shadow-sm"
            : "hover:scale-105 hover:border-primary/50"
        }`}
        onClick={() => onTogglePlacement(pkg.id, placement.id)}
      >
        {placement.name}
      </Badge>
    );
  };

  return (
    <div className="space-y-2">
      {/* Popular Placements */}
      {popularPlacements.length > 0 && (
        <Collapsible
          open={expandedCategories.popular !== false}
          onOpenChange={() => onToggleCategory('popular')}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">
                  Popular Placements
                </span>
                <Badge variant="secondary" className="text-xs">
                  {popularPlacements.length}
                </Badge>
              </div>
              {expandedCategories.popular !== false ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-2">
                {popularPlacements.map((placement) =>
                  renderPlacementBadge(placement)
                )}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Categorized Placements (sorted) */}
      {sortedCategories.map(([category, categoryPlacements]) => {
          const Icon = categoryIcons[category] || Star;
          const label = categoryLabels[category] || category;
          
          return (
            <Collapsible
              key={category}
              open={expandedCategories[category]}
              onOpenChange={() => onToggleCategory(category)}
            >
              <Card className="border-border/50">
                <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-accent transition-colors">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm text-foreground">
                      {label}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {categoryPlacements.length}
                    </Badge>
                  </div>
                  {expandedCategories[category] ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {categoryPlacements.map((placement) =>
                      renderPlacementBadge(placement)
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
    </div>
  );
}
