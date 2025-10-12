import { forwardRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from '../messages/MessageBubble';
import { TypingIndicator } from '../messages/TypingIndicator';
import type { AIMessage } from '@/hooks/useAIAdvisor';

interface MessageListProps {
  messages: AIMessage[];
  isTyping: boolean;
  conversationId?: string;
  isMobile: boolean;
  onViewAllRecommendations?: (messageId: string) => void;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, isTyping, conversationId, isMobile, onViewAllRecommendations }, ref) => {
    return (
      <ScrollArea 
        className="flex-1 p-4 bg-gradient-to-b from-background/50 to-background min-w-0 min-h-0" 
        ref={ref}
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
      </ScrollArea>
    );
  }
);

MessageList.displayName = 'MessageList';
