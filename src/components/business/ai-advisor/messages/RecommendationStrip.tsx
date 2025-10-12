import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RecommendationCard } from '../../RecommendationCard';
import { chatTheme } from '../theme/chatTheme';
import type { RecommendationData } from '@/hooks/useAIAdvisor';

interface RecommendationStripProps {
  recommendations: RecommendationData[];
  messageId: string;
  conversationId?: string;
  isMobile: boolean;
  onViewAll: () => void;
}

export const RecommendationStrip = ({
  recommendations,
  messageId,
  conversationId,
  isMobile,
  onViewAll,
}: RecommendationStripProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-muted-foreground">Recommended for you</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      
      {isMobile ? (
        // Mobile: Show first card + "View All" button
        <div className="space-y-3">
          <RecommendationCard
            recommendation={recommendations[0]}
            conversationId={conversationId}
            messageId={messageId}
          />
          {recommendations.length > 1 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onViewAll}
            >
              View All {recommendations.length} Recommendations
            </Button>
          )}
        </div>
      ) : (
        // Desktop: Horizontal scroll with compact cards
        <>
          <div className="overflow-x-auto pb-3 ai-advisor-scroll snap-x snap-proximity overscroll-x-contain min-w-0">
            <div className="flex gap-2 px-2 flex-nowrap min-w-max">
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={rec.package_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (idx * chatTheme.animations.recommendationDelay) }}
                  className="flex-shrink-0 snap-start"
                  style={{ width: chatTheme.recommendations.desktop.cardWidth }}
                >
                  <RecommendationCard
                    recommendation={rec}
                    conversationId={conversationId}
                    messageId={messageId}
                    variant="compact"
                  />
                </motion.div>
              ))}
            </div>
          </div>
          {recommendations.length > 2 && (
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>←</span>
              <span>Scroll to see all {recommendations.length} recommendations</span>
              <span>→</span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
