import { memo } from 'react';
import { OpportunityCard } from './OpportunityCard';
import type { Opportunity } from '@/types/marketplace';

interface OptimizedOpportunityListProps {
  opportunities: Opportunity[];
  onSave: (id: string) => void;
  onClick: (id: string) => void;
}

/**
 * Optimized list component for rendering opportunities
 * Uses memo to prevent unnecessary re-renders of the entire list
 */
export const OptimizedOpportunityList = memo(({
  opportunities,
  onSave,
  onClick,
}: OptimizedOpportunityListProps) => {
  return (
    <div className="grid gap-4 xs:gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
}, (prevProps, nextProps) => {
  // Only re-render if opportunities array reference changed
  // This prevents re-renders when parent state updates but opportunities stay the same
  return prevProps.opportunities === nextProps.opportunities;
});

OptimizedOpportunityList.displayName = 'OptimizedOpportunityList';
