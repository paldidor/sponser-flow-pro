import { Opportunity, SportType, TierType } from "@/types/marketplace";

// Map DB sport to SportType
export const mapSport = (sport: string | null): SportType => {
  if (!sport) return "Other";
  
  const sportLower = sport.toLowerCase();
  
  if (sportLower.includes("soccer")) return "Soccer";
  if (sportLower.includes("basketball")) return "Basketball";
  if (sportLower.includes("baseball") || sportLower.includes("softball")) return "Baseball";
  if (sportLower.includes("volleyball")) return "Volleyball";
  if (sportLower.includes("football")) return "Football";
  if (sportLower.includes("hockey")) return "Hockey";
  
  return "Other";
};

// Map level_of_play + competition_scope to TierType
export const mapTier = (
  levelOfPlay: string | null, 
  competitionScope: string | null
): TierType => {
  const level = levelOfPlay?.toLowerCase() || "";
  const scope = competitionScope?.toLowerCase() || "";
  
  if (level.includes("elite") || scope.includes("national")) return "Elite";
  if (level.includes("premier") || scope.includes("regional")) return "Premier";
  if (level.includes("competitive")) return "Competitive";
  if (level.includes("travel") || scope.includes("state")) return "Travel";
  if (level.includes("recreational") || scope.includes("local")) return "Recreational";
  
  return "Local";
};

// Parse location "City, State" or "City, State, Country" → { city, state }
export const parseLocation = (location: string | null): { city: string; state: string } => {
  if (!location) return { city: "Unknown", state: "N/A" };
  
  const parts = location.split(",").map(p => p.trim());
  
  return {
    city: parts[0] || "Unknown",
    state: parts[1] || "N/A",
  };
};

// Parse number of players "20-30" → average
export const parsePlayerCount = (players: string | null): number => {
  if (!players) return 0;
  
  const match = players.match(/(\d+)(?:-(\d+))?/);
  if (!match) return 0;
  
  const [, min, max] = match;
  return max ? Math.round((parseInt(min) + parseInt(max)) / 2) : parseInt(min);
};

// Parse duration strings like "6 months", "1-year", "Season" → months
export const parseDuration = (duration: string): number => {
  if (!duration) return 0;
  
  const durationLower = duration.toLowerCase();
  
  // Handle "X months"
  const monthsMatch = durationLower.match(/(\d+)\s*month/);
  if (monthsMatch) return parseInt(monthsMatch[1]);
  
  // Handle "X year" or "X-year"
  const yearsMatch = durationLower.match(/(\d+)[\s-]*year/);
  if (yearsMatch) return parseInt(yearsMatch[1]) * 12;
  
  // Handle "Season" (assume 6 months)
  if (durationLower.includes("season")) return 6;
  
  // Try to extract any number
  const numberMatch = durationLower.match(/(\d+)/);
  return numberMatch ? parseInt(numberMatch[1]) : 3; // Default to 3 months
};

// Calculate estimated weekly reach based on social followers and players
export const calculateEstWeekly = (
  instagramFollowers: number | null,
  facebookFollowers: number | null,
  twitterFollowers: number | null,
  players: number
): number => {
  const socialReach = 
    (instagramFollowers || 0) + 
    (facebookFollowers || 0) + 
    (twitterFollowers || 0);
  
  // Estimate: social reach / 4 weeks + players * 10 (family/friends per player) / 4 weeks
  return Math.round((socialReach + players * 10) / 4);
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get sport-specific placeholder image
export const getSportPlaceholder = (sport: SportType): string => {
  // Use picsum.photos for realistic placeholder images
  // Different seed per sport for variety
  const seedMap: Record<SportType, number> = {
    Soccer: 100,
    Basketball: 200,
    Baseball: 300,
    Volleyball: 400,
    Football: 500,
    Hockey: 600,
    Other: 700,
  };
  
  return `https://picsum.photos/seed/${seedMap[sport]}/640/256`;
};

// Transform Supabase data to Opportunity type
export const transformToOpportunity = (
  offer: {
    id: string;
    title: string;
    fundraising_goal: number;
    duration: string;
    team_profile_id: string | null;
    team_profile?: {
      team_name: string | null;
      location: string | null;
      sport: string | null;
      number_of_players: string | null;
      level_of_play: string | null;
      competition_scope: string | null;
      instagram_followers: number | null;
      facebook_followers: number | null;
      twitter_followers: number | null;
    } | null;
    packages?: Array<{
      id: string;
      price: number;
    }>;
    sponsors?: Array<{ id: string }>;
  }
): Opportunity => {
  const teamProfile = offer.team_profile;
  const { city, state } = parseLocation(teamProfile?.location || null);
  const players = parsePlayerCount(teamProfile?.number_of_players || null);
  const sport = mapSport(teamProfile?.sport || null);
  
  const packages = offer.packages || [];
  const sponsors = offer.sponsors || [];
  
  return {
    id: offer.id,
    sport,
    title: offer.title,
    organization: teamProfile?.team_name || "Unknown Organization",
    team: teamProfile?.team_name || "Unknown Team",
    city,
    state,
    players,
    tier: mapTier(
      teamProfile?.level_of_play || null,
      teamProfile?.competition_scope || null
    ),
    packagesCount: packages.length,
    estWeekly: calculateEstWeekly(
      teamProfile?.instagram_followers || null,
      teamProfile?.facebook_followers || null,
      teamProfile?.twitter_followers || null,
      players
    ),
    durationMonths: parseDuration(offer.duration),
    raised: sponsors.length * 1000, // Placeholder: $1k per sponsor
    goal: offer.fundraising_goal,
    startingAt: packages.length > 0 
      ? Math.min(...packages.map(p => p.price))
      : 0,
    imageUrl: getSportPlaceholder(sport),
    saved: false,
  };
};

// Calculate progress percentage (0-100)
export const calculateProgress = (raised: number, goal: number): number => {
  if (goal <= 0) return 0;
  return Math.min(Math.round((raised / goal) * 100), 100);
};

// Format duration label
export const formatDuration = (months: number): string => {
  return `${months}mo`;
};

// Format location
export const formatLocation = (city: string, state: string): string => {
  return `${city}, ${state}`;
};
