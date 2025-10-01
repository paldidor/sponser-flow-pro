export const calculateReadingTime = (content: string): string => {
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  
  // Count words
  const wordCount = text.trim().split(/\s+/).length;
  
  // Calculate reading time (200 words per minute)
  const minutes = Math.ceil(wordCount / 200);
  
  return `${minutes} min read`;
};
