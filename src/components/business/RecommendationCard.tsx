import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, DollarSign, TrendingUp, ThumbsUp, ThumbsDown, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { RecommendationData } from '@/hooks/useAIAdvisor';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
    navigate(`/marketplace/${recommendation.sponsorship_offer_id}`);
  };

  const handleInterested = async () => {
    await trackInteraction('interested');
    toast({
      title: 'Marked as Interested',
      description: `We'll remember you're interested in ${recommendation.team_name}`,
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
      description: `${recommendation.team_name} saved to review later`,
    });
  };

  // Get the primary image - prefer logo, then first image, then fallback
  const primaryImage = recommendation.logo || recommendation.images?.[0];

  return (
    <Card className={cn("overflow-hidden bg-card hover:shadow-lg transition-shadow duration-300 border-border", isCompact && "shadow-sm")}>
      {/* Header Image */}
      <div className={cn("relative w-full bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden", isCompact ? "h-28" : "h-40")}>
        {primaryImage ? (
          <img 
            src={primaryImage} 
            alt={recommendation.team_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-4xl font-bold text-primary/20">
              {recommendation.team_name.charAt(0)}
            </div>
          </div>
        )}
        
        {/* Sport Badge - Top Left */}
        {recommendation.sport && (
          <Badge 
            className="absolute top-3 left-3 bg-primary text-primary-foreground font-semibold shadow-md"
          >
            {recommendation.sport}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className={cn("space-y-3", isCompact ? "p-3" : "p-4")}>
        {/* Team & Package Name */}
        <div>
          <h4 className={cn("font-bold text-foreground leading-tight", isCompact ? "text-base" : "text-lg")}>
            {recommendation.team_name}
          </h4>
          <p className={cn("text-muted-foreground mt-1", isCompact ? "text-xs" : "text-sm")}>
            {recommendation.package_name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className={cn("grid grid-cols-2 border-y border-border", isCompact ? "gap-2 py-2" : "gap-3 py-3")}>
          <div className="flex items-center gap-2">
            <div className={cn("rounded-lg bg-accent/50", isCompact ? "p-1.5" : "p-2")}>
              <MapPin className={cn("text-primary", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="text-sm font-semibold text-foreground">
                {recommendation.distance_km.toFixed(1)} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={cn("rounded-lg bg-accent/50", isCompact ? "p-1.5" : "p-2")}>
              <Users className={cn("text-primary", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reach</p>
              <p className="text-sm font-semibold text-foreground">
                {recommendation.total_reach.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={cn("rounded-lg bg-accent/50", isCompact ? "p-1.5" : "p-2")}>
              <DollarSign className={cn("text-primary", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-sm font-semibold text-foreground">
                ${recommendation.price.toLocaleString()}
              </p>
            </div>
          </div>

          {recommendation.est_cpf && (
            <div className="flex items-center gap-2">
              <div className={cn("rounded-lg bg-success/10", isCompact ? "p-1.5" : "p-2")}>
                <TrendingUp className={cn("text-success", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CPF</p>
                <p className="text-sm font-semibold text-success">
                  ${recommendation.est_cpf.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        {!userFeedback && (
          <div className={cn("flex gap-2", isCompact ? "mb-2" : "mb-3")}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInterested}
              className={cn("flex-1 border-success/30 hover:bg-success/10 hover:border-success", isCompact && "text-xs px-2")}
            >
              <ThumbsUp className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5", !isCompact && "mr-1")} />
              {!isCompact && "Interested"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaved}
              className={cn("border-accent/30 hover:bg-accent/10 hover:border-accent", isCompact && "px-2")}
            >
              <Bookmark className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNotInterested}
              className={cn("border-destructive/30 hover:bg-destructive/10 hover:border-destructive", isCompact && "px-2")}
            >
              <ThumbsDown className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
            </Button>
          </div>
        )}

        {/* Feedback Badge */}
        {userFeedback && (
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            {userFeedback === 'interested' && (
              <>
                <ThumbsUp className="h-4 w-4 text-success" />
                <span>You're interested in this</span>
              </>
            )}
            {userFeedback === 'saved' && (
              <>
                <Bookmark className="h-4 w-4 text-accent" />
                <span>Saved for later</span>
              </>
            )}
            {userFeedback === 'not_interested' && (
              <>
                <ThumbsDown className="h-4 w-4 text-destructive" />
                <span>Not interested</span>
              </>
            )}
          </div>
        )}

        {/* CTA Button */}
        <Button 
          onClick={handleViewDetails}
          className={cn("w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold", isCompact ? "text-xs py-2" : "text-sm")}
        >
          View Full Details
        </Button>
      </div>
    </Card>
  );
};
