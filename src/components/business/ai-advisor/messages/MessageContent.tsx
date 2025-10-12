interface MessageContentProps {
  content: string;
}

export const MessageContent = ({ content }: MessageContentProps) => {
  return (
    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
      {content}
    </p>
  );
};
