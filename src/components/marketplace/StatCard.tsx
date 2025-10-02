import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { abbreviateStat } from "@/lib/statAbbreviations";

interface StatCardProps {
  value: string | number;
  label: string;
  /** Optional: force abbreviation even if not in map */
  forceAbbreviate?: boolean;
  /** Optional: custom abbreviation override */
  customAbbreviation?: string;
}

export const StatCard = ({ 
  value, 
  label, 
  forceAbbreviate = false,
  customAbbreviation 
}: StatCardProps) => {
  const valueStr = String(value);
  const fullValue = valueStr;
  
  // Determine display value
  let displayValue: string;
  if (customAbbreviation) {
    displayValue = customAbbreviation;
  } else if (forceAbbreviate || valueStr.length > 20) {
    displayValue = abbreviateStat(valueStr);
  } else {
    displayValue = valueStr;
  }
  
  // Check if truncation is needed
  const needsTooltip = displayValue !== fullValue || displayValue.length > 15;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="bg-white rounded-lg p-2.5 shadow-sm border-2 border-[#00aafe] 
                       flex flex-col justify-center items-center gap-0
                       min-h-[100px] sm:min-h-[110px]
                       text-center"
            role="group"
            aria-label={`${label}: ${fullValue}`}
          >
            {/* Value - single line with truncation */}
            <div 
              className="text-lg sm:text-xl font-bold leading-tight mb-0 w-full truncate px-1" 
              style={{ color: '#00aafe' }}
              title={fullValue}
            >
              {displayValue}
            </div>
            
            {/* Label - max 2 lines with clamp */}
            <div 
              className="text-xs text-gray-600 leading-snug line-clamp-2 w-full px-1 mt-0.5"
              title={label}
            >
              {label}
            </div>
          </div>
        </TooltipTrigger>
        
        {needsTooltip && (
          <TooltipContent 
            side="top" 
            className="max-w-[200px] text-center break-words"
          >
            <div className="font-semibold">{fullValue}</div>
            <div className="text-xs opacity-80 mt-1">{label}</div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
