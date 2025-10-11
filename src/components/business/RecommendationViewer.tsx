import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RecommendationCard } from './RecommendationCard';
import { RecommendationData } from '@/hooks/useAIAdvisor';
import { useSwipe } from '@/hooks/use-swipe';
import { useIsMobile } from '@/hooks/use-mobile';

interface RecommendationViewerProps {
  recommendations: RecommendationData[];
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  messageId?: string;
}

export function RecommendationViewer({
  recommendations,
  isOpen,
  onClose,
  conversationId,
  messageId,
}: RecommendationViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();

  const handleNext = () => {
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Swipe gesture support for mobile
  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen || recommendations.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={isMobile 
            ? "fixed inset-0 flex flex-col" 
            : "fixed inset-4 md:inset-8 lg:inset-16 max-w-[800px] mx-auto flex flex-col"}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          {...(isMobile ? swipeHandlers : {})}
        >
          {/* Header */}
          <Card className="flex items-center justify-between p-4 rounded-b-none border-b">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close viewer"
              >
                <X className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold">Recommendations</h2>
                <p className="text-sm text-muted-foreground">
                  {currentIndex + 1} of {recommendations.length}
                </p>
              </div>
            </div>

            {/* Navigation buttons - Desktop only */}
            {!isMobile && recommendations.length > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  aria-label="Previous recommendation"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentIndex === recommendations.length - 1}
                  aria-label="Next recommendation"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </Card>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            {isMobile ? (
              // Mobile: Single card view with swipe
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <RecommendationCard
                    recommendation={recommendations[currentIndex]}
                    conversationId={conversationId}
                    messageId={messageId}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              // Desktop: Grid view of all recommendations
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.package_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <RecommendationCard
                      recommendation={rec}
                      conversationId={conversationId}
                      messageId={messageId}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Mobile Navigation Footer */}
          {isMobile && recommendations.length > 1 && (
            <Card className="flex items-center justify-between p-4 rounded-t-none border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex-1 mr-2"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentIndex === recommendations.length - 1}
                className="flex-1 ml-2"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
