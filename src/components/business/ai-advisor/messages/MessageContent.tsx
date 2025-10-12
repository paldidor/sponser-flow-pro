import { memo } from 'react';

interface MessageContentProps {
  content: string;
}

const MessageContentComponent = ({ content }: MessageContentProps) => {
  return (
    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
      {content}
    </p>
  );
};

// Memoize to prevent re-rendering when content hasn't changed
export const MessageContent = memo(MessageContentComponent);
