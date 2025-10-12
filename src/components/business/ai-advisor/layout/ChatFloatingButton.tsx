import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { floatingButtonVariants } from '../theme/chatVariants';
import { chatTheme } from '../theme/chatTheme';

interface ChatFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const ChatFloatingButton = ({ isOpen, onClick }: ChatFloatingButtonProps) => {
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6"
          style={{ zIndex: chatTheme.zIndex.floatingButton }}
        >
          <Button
            onClick={onClick}
            size="lg"
            className={floatingButtonVariants({ state: 'pulsing' })}
          >
            <MessageCircle className="h-7 w-7 text-primary-foreground" />
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
            <span className="absolute top-2 right-2 h-3 w-3 bg-accent rounded-full border-2 border-white" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
