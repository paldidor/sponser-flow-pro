import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplaceData } from "@/hooks/useMarketplaceData";
import { FilterState } from "@/types/marketplace";
import { HeaderBand } from "@/components/marketplace/HeaderBand";
import { SearchBar } from "@/components/marketplace/SearchBar";
import { FiltersButton } from "@/components/marketplace/FiltersButton";
import { FiltersDrawer } from "@/components/marketplace/FiltersDrawer";
import { OpportunityCard } from "@/components/marketplace/OpportunityCard";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { QueryErrorBoundary } from "@/components/QueryErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

const Marketplace = () => {
  const navigate = useNavigate();
  const { data: opportunities, isLoading, error, refetch } = useMarketplaceData();

  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    sports: [],
    location: "",
    tiers: [],
    durationRange: [0, 12],
    priceRange: [0, 5000],
  });

  // Filter opportunities based on search and filters
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];

    return opportunities.filter((opp) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        opp.title.toLowerCase().includes(searchLower) ||
        opp.organization.toLowerCase().includes(searchLower) ||
        opp.team.toLowerCase().includes(searchLower) ||
        opp.city.toLowerCase().includes(searchLower) ||
        opp.state.toLowerCase().includes(searchLower) ||
        opp.sport.toLowerCase().includes(searchLower);

      // Sports filter
      const matchesSport =
        filters.sports.length === 0 || filters.sports.includes(opp.sport);

      // Location filter
      const matchesLocation =
        !filters.location ||
        opp.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        opp.state.toLowerCase().includes(filters.location.toLowerCase());

      // Tier filter
      const matchesTier =
        filters.tiers.length === 0 || filters.tiers.includes(opp.tier);

      // Duration filter
      const matchesDuration =
        opp.durationMonths >= filters.durationRange[0] &&
        opp.durationMonths <= filters.durationRange[1];

      // Price filter
      const matchesPrice =
        opp.startingAt >= filters.priceRange[0] &&
        opp.startingAt <= filters.priceRange[1];

      return (
        matchesSearch &&
        matchesSport &&
        matchesLocation &&
        matchesTier &&
        matchesDuration &&
        matchesPrice
      );
    });
  }, [opportunities, searchQuery, filters]);

  const handleSaveOpportunity = (id: string) => {
    setSavedOpportunities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleOpportunityClick = (id: string) => {
    navigate(`/marketplace/${id}`);
  };

  if (error) {
    return <QueryErrorBoundary error={error} resetErrorBoundary={() => refetch()} />;
  }

  const activeFiltersCount =
    filters.sports.length +
    filters.tiers.length +
    (filters.location ? 1 : 0) +
    (filters.durationRange[0] > 0 || filters.durationRange[1] < 12 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000 ? 1 : 0);

  const hasActiveFilters =
    searchQuery !== "" ||
    filters.sports.length > 0 ||
    filters.location !== "" ||
    filters.tiers.length > 0 ||
    filters.durationRange[0] > 0 ||
    filters.durationRange[1] < 12 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000;

  return (
    <div className="min-h-screen bg-white">
      <HeaderBand count={filteredOpportunities?.length || 0} />

      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Search & Filters Bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <FiltersButton
            onClick={() => setFiltersOpen(true)}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[128px] w-full rounded-[14px]" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOpportunities.length === 0 && (
          <EmptyState
            message={hasActiveFilters ? "No opportunities match your filters" : "No opportunities found"}
            submessage={hasActiveFilters ? "Try adjusting your search or filters." : "Check back later for new opportunities."}
          />
        )}

        {/* Opportunities Grid */}
        {!isLoading && filteredOpportunities.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={{
                  ...opportunity,
                  saved: savedOpportunities.has(opportunity.id),
                }}
                onSave={handleSaveOpportunity}
                onClick={handleOpportunityClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filters Drawer */}
      <FiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

export default Marketplace;
