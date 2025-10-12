import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAIConversation, RecommendationData } from '@/hooks/useAIConversation';
import { usePerformanceMonitor, useLatencyTracker } from '@/hooks/usePerformanceMonitor';
import {
  ChatFloatingButton,
  ChatHeader,
  ChatInputArea,
  MessageList,
  PreferencesBadge,
  chatTheme,
  chatWindowVariants,
} from './ai-advisor';

// Lazy load RecommendationViewer for code splitting
const RecommendationViewer = lazy(() => 
  import('./RecommendationViewer').then(module => ({ default: module.RecommendationViewer }))
);

export const AIAdvisorChat = () => {
  usePerformanceMonitor('AIAdvisorChat');
  const { trackLatency } = useLatencyTracker();
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeRecommendations, setActiveRecommendations] = useState<RecommendationData[]>([]);
  const [activeMessageId, setActiveMessageId] = useState<string | undefined>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading, isTyping, savedPreferences, conversationId } = useAIConversation();
  const isMobile = useIsMobile();

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const startTime = performance.now();
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
    trackLatency('AI message send', startTime);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openRecommendationViewer = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message?.recommendations) {
      setActiveRecommendations(message.recommendations);
      setActiveMessageId(messageId);
      setViewerOpen(true);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      // Original attempt on Root
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      // Radix viewport fallback
      const viewport = scrollAreaRef.current.querySelector?.('[data-radix-scroll-area-viewport]') as HTMLDivElement | null;
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isTyping]);

  // Send welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendMessage("Hello! I'm ready to help you find the perfect sponsorship opportunities.");
    }
  }, [isOpen]);

  return (
    <>
      <ChatFloatingButton isOpen={isOpen} onClick={() => setIsOpen(true)} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "fixed",
              isMobile ? chatTheme.layout.mobile.position : chatTheme.layout.desktop.position,
              !isMobile && `w-[${chatTheme.layout.desktop.width}px] shadow-2xl`
            )}
            style={{ zIndex: chatTheme.zIndex.chatWindow }}
          >
            <Card className={chatWindowVariants({ platform: isMobile ? 'mobile' : 'desktop' })}>
              <ChatHeader onClose={() => setIsOpen(false)} />
              
              <PreferencesBadge preferences={savedPreferences} />

              <MessageList
                messages={messages}
                isTyping={isTyping}
                conversationId={conversationId || undefined}
                isMobile={isMobile}
                onViewAllRecommendations={openRecommendationViewer}
                ref={scrollAreaRef}
              />

              <ChatInputArea
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                onKeyPress={handleKeyPress}
                isLoading={isLoading}
                showHint={messages.length === 0}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <RecommendationViewer
          recommendations={activeRecommendations}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          conversationId={conversationId || undefined}
          messageId={activeMessageId}
        />
      </Suspense>
    </>
  );
};
