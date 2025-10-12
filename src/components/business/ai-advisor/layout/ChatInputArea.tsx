import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { debounce } from '@/lib/performanceUtils';

interface ChatInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  showHint: boolean;
}

export const ChatInputArea = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading,
  showHint,
}: ChatInputAreaProps) => {
  // Debounce onChange to reduce state updates while typing
  const debouncedOnChange = useCallback(
    debounce((newValue: string) => {
      onChange(newValue);
    }, 150),
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update input immediately for responsive UI
    const newValue = e.target.value;
    onChange(newValue);
    
    // Debounce expensive operations (e.g., typing indicators)
    debouncedOnChange(newValue);
  };

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 shrink-0">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={handleChange}
          onKeyPress={onKeyPress}
          placeholder="Ask about sponsorship opportunities..."
          disabled={isLoading}
          className="flex-1 border-border focus-visible:ring-primary bg-background/80 backdrop-blur-sm"
        />
        <Button
          onClick={onSend}
          disabled={isLoading || !value.trim()}
          size="icon"
          className="shrink-0 bg-gradient-to-br from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Quick Action Hint */}
      {showHint && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground mt-2 text-center"
        >
          💡 Tell me your budget, sport, or location to get started
        </motion.p>
      )}
    </div>
  );
};
