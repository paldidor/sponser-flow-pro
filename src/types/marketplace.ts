export type SportType = 
  | "Soccer" 
  | "Basketball" 
  | "Baseball" 
  | "Volleyball" 
  | "Football" 
  | "Hockey" 
  | "Other";

export type TierType = 
  | "Elite" 
  | "Premier" 
  | "Competitive" 
  | "Travel" 
  | "Local" 
  | "Recreational";

export interface Opportunity {
  id: string;
  sport: SportType;
  title: string;
  organization: string;
  team: string;
  city: string;
  state: string;
  players: number;
  tier: TierType;
  packagesCount: number;
  estWeekly: number;
  durationMonths: number;
  raised: number;
  goal: number;
  startingAt: number;
  imageUrl: string;
  saved?: boolean;
}

export interface FilterState {
  sports: SportType[];
  location: string;
  tiers: TierType[];
  durationRange: [number, number];
  priceRange: [number, number];
}

export interface OpportunityCardProps {
  opportunity: Opportunity;
  onSave: (id: string) => void;
  onClick: (id: string) => void;
}
