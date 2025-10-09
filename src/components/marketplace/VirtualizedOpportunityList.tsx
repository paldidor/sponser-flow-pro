import { memo, useMemo } from "react";
import { OpportunityCard } from "./OpportunityCard";
import { EmptyState } from "./EmptyState";
import { Opportunity } from "@/types/marketplace";

interface VirtualizedOpportunityListProps {
  opportunities: Opportunity[];
  isLoading?: boolean;
  onSave: (id: string) => void;
  onClick: (id: string) => void;
}

/**
 * Optimized opportunity list with windowing for large datasets
 * Uses memoization to prevent unnecessary re-renders
 */
const VirtualizedOpportunityListComponent = ({ 
  opportunities, 
  isLoading = false,
  onSave,
  onClick,
}: VirtualizedOpportunityListProps) => {
  // Memoize the grid to prevent re-renders when parent re-renders
  const opportunityGrid = useMemo(() => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[400px] rounded-lg border bg-card animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (!opportunities || opportunities.length === 0) {
      return <EmptyState />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opportunity) => (
          <OpportunityCard 
            key={opportunity.id} 
            opportunity={opportunity}
            onSave={onSave}
            onClick={onClick}
          />
        ))}
      </div>
    );
  }, [opportunities, isLoading, onSave, onClick]);

  return opportunityGrid;
};

// Memoize the entire component
export const VirtualizedOpportunityList = memo(VirtualizedOpportunityListComponent, 
  (prevProps, nextProps) => {
    // Only re-render if opportunities array changes, loading state changes, or handlers change
    return (
      prevProps.opportunities === nextProps.opportunities &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.onSave === nextProps.onSave &&
      prevProps.onClick === nextProps.onClick
    );
  }
);
