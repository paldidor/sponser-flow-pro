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

  return (
    <Card className="p-4 bg-accent/50 border-accent">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{recommendation.team_name}</h4>
            <p className="text-sm text-muted-foreground">{recommendation.package_name}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            ${recommendation.price.toLocaleString()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{recommendation.distance_km.toFixed(1)} km away</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{recommendation.total_reach.toLocaleString()} reach</span>
          </div>
          {recommendation.est_cpf && (
            <>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                <span>${recommendation.est_cpf.toFixed(2)} CPF</span>
              </div>
              <div className="flex items-center gap-1.5 text-success">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Great ROI</span>
              </div>
            </>
          )}
        </div>

        <Button 
          onClick={handleViewDetails}
          className="w-full"
          size="sm"
        >
          View Full Details
        </Button>
      </div>
    </Card>
  );
};
