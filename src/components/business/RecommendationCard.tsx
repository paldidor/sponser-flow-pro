import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, DollarSign, TrendingUp, ThumbsUp, ThumbsDown, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { RecommendationData } from '@/hooks/useAIAdvisor';
import { useState } from 'react';

interface RecommendationCardProps {
  recommendation: RecommendationData;
  conversationId?: string;
  messageId?: string;
}

export const RecommendationCard = ({ recommendation, conversationId, messageId }: RecommendationCardProps) => {
  const navigate = useNavigate();
  const [userFeedback, setUserFeedback] = useState<string | null>(null);

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
    <Card className="overflow-hidden bg-card hover:shadow-lg transition-shadow duration-300 border-border">
      {/* Header Image */}
      <div className="relative h-40 w-full bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
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
      <div className="p-4 space-y-3">
        {/* Team & Package Name */}
        <div>
          <h4 className="font-bold text-lg text-foreground leading-tight">
            {recommendation.team_name}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {recommendation.package_name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/50">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="text-sm font-semibold text-foreground">
                {recommendation.distance_km.toFixed(1)} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/50">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reach</p>
              <p className="text-sm font-semibold text-foreground">
                {recommendation.total_reach.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/50">
              <DollarSign className="h-4 w-4 text-primary" />
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
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-4 w-4 text-success" />
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
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleInterested}
              className="flex-1 border-success/30 hover:bg-success/10 hover:border-success"
            >
              <ThumbsUp className="h-3.5 w-3.5 mr-1" />
              Interested
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaved}
              className="border-accent/30 hover:bg-accent/10 hover:border-accent"
            >
              <Bookmark className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNotInterested}
              className="border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
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
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          View Full Details
        </Button>
      </div>
    </Card>
  );
};
