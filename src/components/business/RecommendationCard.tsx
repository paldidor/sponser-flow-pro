import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RecommendationData } from '@/hooks/useAIAdvisor';

interface RecommendationCardProps {
  recommendation: RecommendationData;
}

export const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/marketplace/${recommendation.sponsorship_offer_id}`);
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
