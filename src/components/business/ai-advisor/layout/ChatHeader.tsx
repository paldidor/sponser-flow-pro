import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader = ({ onClose }: ChatHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-primary via-primary to-primary-dark text-primary-foreground p-5 flex items-center justify-between relative overflow-hidden shrink-0">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-base">Sponsorship Advisor</h3>
          <p className="text-xs opacity-90 font-medium">Powered by AI</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="text-primary-foreground hover:bg-white/20 transition-colors relative z-10"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};
