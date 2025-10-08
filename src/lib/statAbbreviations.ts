/**
 * Abbreviation mappings for stat values (e.g., level of play)
 */
const STAT_ABBREVIATIONS: Record<string, string> = {
  "Professional": "Pro",
  "Semi-Professional": "Semi-Pro",
  "Competitive": "Comp",
  "Recreational": "Rec",
  "Youth": "Youth",
  "High School": "HS",
  "College": "College",
  "University": "Uni",
  "Amateur": "Amateur",
};

/**
 * Abbreviates stat values for compact display
 * @param value - Full stat value string
 * @returns Abbreviated string or original if no mapping exists
 */
export function abbreviateStat(value: string): string {
  return STAT_ABBREVIATIONS[value] || value;
}

/**
 * Maps full US state names to their 2-letter abbreviations
 */
export const US_STATE_ABBREVIATIONS: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY"
};

/**
 * Formats location string for display
 * @param location - Full location string (e.g., "Las Vegas, Nevada")
 * @param mobile - Whether to use abbreviated format for mobile
 * @returns Formatted location string
 */
export function formatLocation(location: string, mobile: boolean = false): string {
  if (!location) return "";
  
  if (!mobile) return location;
  
  // Parse "City, State" format
  const parts = location.split(",").map(s => s.trim());
  if (parts.length !== 2) return location;
  
  const [city, state] = parts;
  const abbreviation = US_STATE_ABBREVIATIONS[state];
  
  return abbreviation ? `${city}, ${abbreviation}` : location;
}
