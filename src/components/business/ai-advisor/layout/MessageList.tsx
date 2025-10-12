import { forwardRef, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MessageBubble } from '../messages/MessageBubble';
import { TypingIndicator } from '../messages/TypingIndicator';
import type { AIMessage } from '@/hooks/useAIAdvisor';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface MessageListProps {
  messages: AIMessage[];
  isTyping: boolean;
  conversationId?: string;
  isMobile: boolean;
  onViewAllRecommendations?: (messageId: string) => void;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, isTyping, conversationId, isMobile, onViewAllRecommendations }, ref) => {
    usePerformanceMonitor('MessageList');
    const parentRef = useRef<HTMLDivElement>(null);
    const shouldAutoScroll = useRef(true);

    // Virtualize only for large lists (>50 messages)
    const useVirtual = messages.length > 50;

    const virtualizer = useVirtualizer({
      count: messages.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 120, // Estimated message height
      overscan: 5, // Render 5 extra items above/below viewport
      enabled: useVirtual,
    });

    // Auto-scroll to bottom on new messages
    useEffect(() => {
      if (shouldAutoScroll.current && parentRef.current) {
        const scrollElement = parentRef.current;
        const isNearBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight < 100;
        
        if (isNearBottom || messages.length === 1) {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: 'smooth',
          });
        }
      }
    }, [messages.length]);

    // Track scroll position to disable auto-scroll when user scrolls up
    const handleScroll = () => {
      if (parentRef.current) {
        const scrollElement = parentRef.current;
        const isNearBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight < 100;
        shouldAutoScroll.current = isNearBottom;
      }
    };

    if (!useVirtual) {
      // Non-virtualized rendering for small lists
      return (
        <div 
          ref={parentRef}
          onScroll={handleScroll}
          className="flex-1 p-4 bg-gradient-to-b from-background/50 to-background min-w-0 min-h-0 overflow-y-auto"
        >
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                index={index}
                conversationId={conversationId}
                isMobile={isMobile}
                onViewAllRecommendations={onViewAllRecommendations}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        </div>
      );
    }

    // Virtualized rendering for large lists
    const items = virtualizer.getVirtualItems();

    return (
      <div 
        ref={parentRef}
        onScroll={handleScroll}
        className="flex-1 p-4 bg-gradient-to-b from-background/50 to-background min-w-0 min-h-0 overflow-y-auto"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {items.map((virtualRow) => {
            const msg = messages[virtualRow.index];
            return (
              <div
                key={msg.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="mb-4">
                  <MessageBubble
                    message={msg}
                    index={virtualRow.index}
                    conversationId={conversationId}
                    isMobile={isMobile}
                    onViewAllRecommendations={onViewAllRecommendations}
                  />
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div
              style={{
                position: 'absolute',
                top: `${virtualizer.getTotalSize()}px`,
                left: 0,
                width: '100%',
              }}
            >
              <TypingIndicator />
            </div>
          )}
        </div>
      </div>
    );
  }
);

MessageList.displayName = 'MessageList';
