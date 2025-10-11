import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useAIAdvisor, RecommendationData } from '@/hooks/useAIAdvisor';
import { RecommendationCard } from './RecommendationCard';
import { RecommendationViewer } from './RecommendationViewer';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export const AIAdvisorChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeRecommendations, setActiveRecommendations] = useState<RecommendationData[]>([]);
  const [activeMessageId, setActiveMessageId] = useState<string | undefined>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading, isTyping, savedPreferences, conversationId } = useAIAdvisor();
  const isMobile = useIsMobile();

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openRecommendationViewer = (recommendations: RecommendationData[], messageId?: string) => {
    setActiveRecommendations(recommendations);
    setActiveMessageId(messageId);
    setViewerOpen(true);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
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
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-16 w-16 rounded-full shadow-2xl hover:shadow-[0_20px_50px_rgba(0,170,254,0.4)] transition-all duration-300 bg-gradient-to-br from-primary to-primary-dark relative group"
            >
              <MessageCircle className="h-7 w-7 text-primary-foreground" />
              {/* Pulse animation */}
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
              <span className="absolute top-2 right-2 h-3 w-3 bg-accent rounded-full border-2 border-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          "fixed z-50",
          isMobile 
            ? "inset-0" 
            : "right-0 top-0 bottom-0 w-[520px] shadow-2xl"
        )}
          >
            <Card className={cn(
              "flex flex-col shadow-2xl border-2 overflow-hidden backdrop-blur-xl bg-card/95",
              isMobile ? "h-full rounded-none border-0" : "h-full rounded-none"
            )}>
              {/* Header with Gradient */}
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
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground hover:bg-white/20 transition-colors relative z-10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Saved Preferences Badge - Enhanced */}
              {savedPreferences && Object.keys(savedPreferences).length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-gradient-to-r from-accent/30 via-accent/20 to-accent/30 px-4 py-3 border-b border-border/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <p className="text-xs font-semibold text-foreground">Your Preferences</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {savedPreferences.sports && savedPreferences.sports.length > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30"
                      >
                        🏆 {savedPreferences.sports.join(', ')}
                      </motion.span>
                    )}
                    {savedPreferences.budgetMin && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/30"
                      >
                        💰 ${savedPreferences.budgetMin.toLocaleString()}{savedPreferences.budgetMax ? ` - $${savedPreferences.budgetMax.toLocaleString()}` : '+'}
                      </motion.span>
                    )}
                    {savedPreferences.radiusKm && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-card border border-border"
                      >
                        📍 {savedPreferences.radiusKm}km
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Messages - Enhanced */}
              <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-background/50 to-background" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex gap-2",
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 shadow-sm",
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary-dark text-primary-foreground rounded-br-sm max-w-[85%]'
                            : 'bg-card border border-border rounded-bl-sm w-full'
                        )}
                      >
                        <p className="text-sm leading-relaxed break-words whitespace-normal">{msg.content}</p>
                        
                        {/* Recommendations - Mobile First */}
                        {msg.recommendations && msg.recommendations.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-4"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-semibold text-muted-foreground">Recommended for you</span>
                              <div className="h-px flex-1 bg-border" />
                            </div>
                            
                            {isMobile ? (
                              // Mobile: Show first card + "View All" button
                              <div className="space-y-3">
                                <RecommendationCard
                                  recommendation={msg.recommendations[0]}
                                  conversationId={conversationId || undefined}
                                  messageId={msg.id}
                                />
                                {msg.recommendations.length > 1 && (
                                  <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => openRecommendationViewer(msg.recommendations!, msg.id)}
                                  >
                                    View All {msg.recommendations.length} Recommendations
                                  </Button>
                                )}
                              </div>
                            ) : (
                              // Desktop: Horizontal scroll with compact cards
                              <>
                                <div className="overflow-x-auto pb-3 -mx-1 ai-advisor-scroll">
                                  <div className="flex gap-2.5 px-1">
                                    {msg.recommendations.map((rec, idx) => (
                                      <motion.div
                                        key={rec.package_id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + (idx * 0.1) }}
                                        className="flex-shrink-0 w-[280px]"
                                      >
                                        <RecommendationCard
                                          recommendation={rec}
                                          conversationId={conversationId || undefined}
                                          messageId={msg.id}
                                          variant="compact"
                                        />
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                                {msg.recommendations.length > 2 && (
                                  <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <span>←</span>
                                    <span>Scroll to see all {msg.recommendations.length} recommendations</span>
                                    <span>→</span>
                                  </div>
                                )}
                              </>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator - Enhanced */}
                  {isTyping && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2 justify-start"
                    >
                      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <div className="flex gap-1.5">
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 rounded-full bg-primary"
                          />
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 rounded-full bg-primary"
                          />
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 rounded-full bg-primary"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area - Enhanced */}
              <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about sponsorship opportunities..."
                    disabled={isLoading}
                    className="flex-1 border-border focus-visible:ring-primary bg-background/80 backdrop-blur-sm"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
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
                {messages.length === 0 && (
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
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendation Viewer Modal */}
      <RecommendationViewer
        recommendations={activeRecommendations}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        conversationId={conversationId || undefined}
        messageId={activeMessageId}
      />
    </>
  );
};
