import { motion } from 'framer-motion';
import { messageBubbleVariants, messageRowVariants } from '../theme/chatVariants';
import { chatTheme } from '../theme/chatTheme';
import { MessageContent } from './MessageContent';
import { RecommendationStrip } from './RecommendationStrip';
import type { AIMessage } from '@/hooks/useAIAdvisor';

interface MessageBubbleProps {
  message: AIMessage;
  index: number;
  conversationId?: string;
  isMobile: boolean;
  onViewAllRecommendations?: (messageId: string) => void;
}

export const MessageBubble = ({
  message,
  index,
  conversationId,
  isMobile,
  onViewAllRecommendations,
}: MessageBubbleProps) => {
  const handleViewAll = () => {
    if (onViewAllRecommendations) {
      onViewAllRecommendations(message.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * chatTheme.animations.messageDelay }}
      className={messageRowVariants({ role: message.role })}
    >
      <div className={messageBubbleVariants({ role: message.role })}>
        <MessageContent content={message.content} />
        
        {message.recommendations && message.recommendations.length > 0 && (
          <RecommendationStrip
            recommendations={message.recommendations}
            messageId={message.id}
            conversationId={conversationId}
            isMobile={isMobile}
            onViewAll={handleViewAll}
          />
        )}
      </div>
    </motion.div>
  );
};
