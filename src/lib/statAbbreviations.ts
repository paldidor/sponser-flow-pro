/**
 * Maps long stat values to abbreviated versions for display
 * while preserving full text for accessibility
 */
export const STAT_ABBREVIATIONS: Record<string, string> = {
  // Competition names
  "Northern Counties Soccer Association (NCSA)": "NCSA",
  "Northern Counties Soccer Association": "NCSA",
  "United States Youth Soccer Association": "USYSA",
  "National Premier Leagues": "NPL",
  "Elite Clubs National League": "ECNL",
  
  // Competition scopes (if needed)
  "International": "Intl",
  "National": "National",
  "Regional": "Regional",
  "Local": "Local",
};

/**
 * Abbreviates a value if it matches known patterns
 * @param value - Original value to potentially abbreviate
 * @returns Abbreviated version or original if no match
 */
export function abbreviateStat(value: string): string {
  return STAT_ABBREVIATIONS[value] ?? value;
}

/**
 * Truncates numeric values that are too long
 * @param value - Numeric string to truncate
 * @param maxLength - Maximum character length before truncating
 */
export function truncateNumeric(value: string, maxLength: number = 10): string {
  if (value.length <= maxLength) return value;
  
  // For very large numbers, use K/M/B notation
  const num = parseFloat(value.replace(/,/g, ''));
  if (isNaN(num)) return value;
  
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  
  return value;
}
