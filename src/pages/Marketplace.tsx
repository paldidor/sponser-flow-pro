import { useState, useMemo, useCallback, useEffect, lazy, Suspense, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplaceData } from "@/hooks/useMarketplaceData";
import { FilterState } from "@/types/marketplace";
import { HeaderBand } from "@/components/marketplace/HeaderBand";
import { SearchBar } from "@/components/marketplace/SearchBar";
import { FiltersButton } from "@/components/marketplace/FiltersButton";
import { OptimizedOpportunityList } from "@/components/marketplace/OptimizedOpportunityList";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { QueryErrorBoundary } from "@/components/QueryErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components for better initial load performance
const FiltersDrawer = lazy(() => import("@/components/marketplace/FiltersDrawer").then(m => ({ default: m.FiltersDrawer })));
const Footer = lazy(() => import("@/components/layout/Footer"));

const Marketplace = () => {
  const navigate = useNavigate();
  const { data: opportunities, isLoading, error, refetch } = useMarketplaceData();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    sports: [],
    location: "",
    tiers: [],
    durationRange: [0, 12],
    priceRange: [0, 5000],
  });

  // Debounce search query for better mobile performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter opportunities based on search and filters (memoized for performance)
  // Split filtering logic for better readability and potential optimization
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];

    const searchLower = debouncedSearchQuery.toLowerCase();
    
    return opportunities.filter((opp) => {
      // Early return optimizations - check cheapest operations first
      
      // Sports filter (array lookup is fast)
      if (filters.sports.length > 0 && !filters.sports.includes(opp.sport)) {
        return false;
      }

      // Tier filter (array lookup)
      if (filters.tiers.length > 0 && !filters.tiers.includes(opp.tier)) {
        return false;
      }

      // Duration filter (numeric comparison is fast)
      if (
        opp.durationMonths < filters.durationRange[0] ||
        opp.durationMonths > filters.durationRange[1]
      ) {
        return false;
      }

      // Price filter (numeric comparison)
      if (
        opp.startingAt < filters.priceRange[0] ||
        opp.startingAt > filters.priceRange[1]
      ) {
        return false;
      }

      // Location filter (string operation - slower)
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        if (
          !opp.city.toLowerCase().includes(locationLower) &&
          !opp.state.toLowerCase().includes(locationLower)
        ) {
          return false;
        }
      }

      // Search filter (most expensive - do last)
      if (debouncedSearchQuery) {
        return (
          opp.title.toLowerCase().includes(searchLower) ||
          opp.organization.toLowerCase().includes(searchLower) ||
          opp.team.toLowerCase().includes(searchLower) ||
          opp.city.toLowerCase().includes(searchLower) ||
          opp.state.toLowerCase().includes(searchLower) ||
          opp.sport.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [opportunities, debouncedSearchQuery, filters]);

  const handleSaveOpportunity = useCallback((id: string) => {
    setSavedOpportunities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleOpportunityClick = useCallback((id: string) => {
    navigate(`/marketplace/${id}`);
  }, [navigate]);

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
    debouncedSearchQuery !== "" ||
    filters.sports.length > 0 ||
    filters.location !== "" ||
    filters.tiers.length > 0 ||
    filters.durationRange[0] > 0 ||
    filters.durationRange[1] < 12 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HeaderBand count={filteredOpportunities?.length || 0} />

      <div className="container mx-auto flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Search & Filters Bar - Optimized for mobile touch */}
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

        {/* Opportunities Grid - Optimized rendering */}
        {!isLoading && filteredOpportunities.length > 0 && (
          <OptimizedOpportunityList
            opportunities={filteredOpportunities.map((opp) => ({
              ...opp,
              saved: savedOpportunities.has(opp.id),
            }))}
            onSave={handleSaveOpportunity}
            onClick={handleOpportunityClick}
          />
        )}
      </div>

      {/* Footer - Lazy loaded */}
      <Suspense fallback={<div className="h-32" />}>
        <Footer />
      </Suspense>

      {/* Filters Drawer - Lazy loaded */}
      <Suspense fallback={null}>
        <FiltersDrawer
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </Suspense>
    </div>
  );
};

export default Marketplace;
