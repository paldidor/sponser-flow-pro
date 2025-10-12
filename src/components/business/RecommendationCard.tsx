import { Button } from '@/components/ui/button';
import { MapPin, Users, ThumbsUp, ThumbsDown, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { RecommendationData } from '@/hooks/useAIAdvisor';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tag } from '@/components/marketplace/Tag';
import { StatTile } from '@/components/marketplace/StatTile';
import { ProgressBar } from '@/components/marketplace/ProgressBar';
import { formatCurrency, formatDuration, formatLocation } from '@/lib/marketplaceUtils';
import calendarIcon from '@/assets/icons/calendar-stat.svg';
import usersIcon from '@/assets/icons/users-stat.svg';
import targetIcon from '@/assets/icons/target-stat.svg';

interface RecommendationCardProps {
  recommendation: RecommendationData;
  conversationId?: string;
  messageId?: string;
  variant?: 'default' | 'compact';
}

export const RecommendationCard = ({ recommendation, conversationId, messageId, variant = 'default' }: RecommendationCardProps) => {
  const navigate = useNavigate();
  const [userFeedback, setUserFeedback] = useState<string | null>(null);
  const isCompact = variant === 'compact';

  // Safe fallback values for backward compatibility with old recommendation data
  const safeRecommendation = {
    ...recommendation,
    estWeekly: recommendation.estWeekly ?? 0,
    packagesCount: recommendation.packagesCount ?? 1,
    players: recommendation.players ?? 0,
    city: recommendation.city ?? 'Unknown',
    state: recommendation.state ?? 'Unknown',
    durationMonths: recommendation.durationMonths ?? 6,
    tier: recommendation.tier ?? 'Local',
    raised: recommendation.raised ?? 0,
    goal: recommendation.goal ?? recommendation.price ?? 0,
    title: recommendation.title ?? recommendation.team_name,
    organization: recommendation.organization ?? recommendation.team_name,
  };

  const trackInteraction = async (action: string) => {
    if (!conversationId) return;
    
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ user_action: action })
        .eq('conversation_id', conversationId)
        .eq('package_id', recommendation.package_id);
      
      if (!error) {
        console.log(`✅ Tracked ${action}:`, recommendation.team_name);
        setUserFeedback(action);
      }
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  };

  const handleViewDetails = async () => {
    await trackInteraction('clicked');
    navigate(`/marketplace/${safeRecommendation.sponsorship_offer_id}`);
  };

  const handleInterested = async () => {
    await trackInteraction('interested');
    toast({
      title: 'Marked as Interested',
      description: `We'll remember you're interested in ${safeRecommendation.team_name}`,
    });
  };

  const handleNotInterested = async () => {
    await trackInteraction('not_interested');
    toast({
      title: 'Noted',
      description: 'We won\'t show similar opportunities',
    });
  };

  const handleSaved = async () => {
    await trackInteraction('saved');
    toast({
      title: 'Saved for Later',
      description: `${safeRecommendation.team_name} saved to review later`,
    });
  };

  // Get the primary image - prefer logo, then first image, then fallback
  const primaryImage = safeRecommendation.logo || safeRecommendation.images?.[0];

  return (
    <article 
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white transition-shadow hover:shadow-lg animate-fade-in",
        isCompact && "max-w-[300px]"
      )}
      onClick={handleViewDetails}
    >
      {/* Hero Section - Matches OpportunityCard exactly */}
      <div className={cn("relative w-full bg-gray-100", isCompact ? "h-[112px]" : "h-[128px]")}>
        {primaryImage ? (
          <img 
            src={primaryImage} 
            alt={safeRecommendation.title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#00AAFE]/10 to-[#FFB82D]/10">
            <div className="text-4xl font-bold text-[#00AAFE]/20">
              {safeRecommendation.team_name.charAt(0)}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />

        {/* Sport Pill - Top Left */}
        {safeRecommendation.sport && (
          <span className={cn(
            "absolute left-3 top-3 rounded-full bg-[#FFB82D] px-3 py-1 font-medium text-black",
            isCompact ? "text-[11px] leading-3" : "text-[12px] leading-4"
          )}>
            {safeRecommendation.sport}
          </span>
        )}

        {/* Bookmark Button - Top Right */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleSaved();
          }}
          className={cn(
            "absolute right-3 top-3 grid place-items-center rounded-full bg-black/20 p-2 transition-colors hover:bg-black/40 active:scale-95",
            userFeedback === 'saved' && "bg-[#00AAFE] hover:bg-[#00AAFE]/90",
            isCompact ? "min-h-[36px] min-w-[36px]" : "min-h-[44px] min-w-[44px]"
          )}
          aria-label={userFeedback === 'saved' ? "Remove bookmark" : "Save recommendation"}
        >
          <Bookmark className={cn(
            "stroke-white",
            userFeedback === 'saved' && "fill-white",
            isCompact ? "h-4 w-4" : "h-5 w-5"
          )} />
        </button>

        {/* Hero Text Stack - Bottom Left */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-0.5">
          <h3 className={cn(
            "line-clamp-1 font-bold text-white drop-shadow-md",
            isCompact ? "text-[16px] leading-[20px]" : "text-[18px] leading-[22.5px]"
          )}>
            {safeRecommendation.title}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <div className={cn("flex flex-1 flex-col gap-3", isCompact ? "p-3.5" : "p-4")}>
        {/* Meta Row - Location, Players, Tier */}
        <div className={cn(
          "flex flex-wrap items-center gap-3 text-[#4A5565]",
          isCompact ? "gap-2 text-[11px] leading-3" : "text-[12px] leading-4"
        )}>
          <span className="inline-flex items-center gap-1">
            <MapPin className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
            {formatLocation(safeRecommendation.city, safeRecommendation.state)}
          </span>
          {/* Show players in compact mode too */}
          <span className="inline-flex items-center gap-1">
            <Users className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
            {safeRecommendation.players} {isCompact ? '' : 'players'}
          </span>
          {!isCompact && (
            <Tag label={safeRecommendation.tier} />
          )}
        </div>

        {/* Stats Grid - 3 columns in compact for better info density */}
        <div className="grid grid-cols-3 gap-3">
          <StatTile 
            icon={targetIcon} 
            value={safeRecommendation.packagesCount} 
            label="Packages" 
          />
          <StatTile 
            icon={usersIcon} 
            value={safeRecommendation.estWeekly.toLocaleString()} 
            label={isCompact ? "Weekly" : "Est. Weekly"}
          />
          <StatTile 
            icon={calendarIcon} 
            value={formatDuration(safeRecommendation.durationMonths)} 
            label="Duration" 
          />
        </div>

        {/* Progress Bar */}
        <ProgressBar 
          raised={safeRecommendation.raised} 
          goal={safeRecommendation.goal}
        />

        {/* Quick Action Buttons - AI Specific Feature */}
        {!userFeedback && (
          <div className={cn("flex gap-2", isCompact && "mt-1")}>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleInterested();
              }}
              className={cn(
                "flex-1 border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/10 hover:border-[#22C55E]",
                isCompact && "text-[11px] px-2 h-8"
              )}
            >
              <ThumbsUp className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5", !isCompact && "mr-1")} />
              {!isCompact && "Interested"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleNotInterested();
              }}
              className={cn(
                "border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 hover:border-[#EF4444]",
                isCompact ? "px-2 h-8" : "px-3"
              )}
            >
              <ThumbsDown className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
            </Button>
          </div>
        )}

        {/* Feedback Badge */}
        {userFeedback && userFeedback !== 'saved' && userFeedback !== 'clicked' && (
          <div className={cn(
            "flex items-center gap-2 text-[#6A7282]",
            isCompact ? "text-[10px]" : "text-[12px]"
          )}>
            {userFeedback === 'interested' && (
              <>
                <ThumbsUp className={cn("text-[#22C55E]", isCompact ? "h-3 w-3" : "h-4 w-4")} />
                <span>You're interested</span>
              </>
            )}
            {userFeedback === 'not_interested' && (
              <>
                <ThumbsDown className={cn("text-[#EF4444]", isCompact ? "h-3 w-3" : "h-4 w-4")} />
                <span>Not interested</span>
              </>
            )}
          </div>
        )}

        {/* Footer: Price & CTA */}
        <div className={cn("mt-auto flex items-center justify-between", isCompact ? "pt-1" : "pt-2")}>
          <div className="flex flex-col">
            <span className={cn("text-[#6A7282]", isCompact ? "text-[10px]" : "text-[12px]")}>
              Package Price
            </span>
            <span className={cn("font-bold text-[#00AAFE]", isCompact ? "text-[15px] leading-5" : "text-[18px] leading-7")}>
              {formatCurrency(safeRecommendation.price)}
            </span>
          </div>
          <Button 
            onClick={handleViewDetails}
            className={cn(
              "rounded-[10px] bg-[#00AAFE] font-medium text-white hover:bg-[#00AAFE]/90 active:scale-95",
              isCompact ? "h-9 px-3 text-[12px]" : "h-11 min-h-[44px] px-4 text-[14px]"
            )}
          >
            View Details
          </Button>
        </div>
      </div>
    </article>
  );
};
