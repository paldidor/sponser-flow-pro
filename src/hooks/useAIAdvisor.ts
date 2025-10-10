import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: RecommendationData[];
  timestamp: Date;
}

export interface RecommendationData {
  team_profile_id: string;
  team_name: string;
  distance_km: number;
  total_reach: number;
  sponsorship_offer_id: string;
  package_id: string;
  package_name: string;
  price: number;
  est_cpf: number | null;
  marketplace_url: string;
  sport: string | null;
  logo: string | null;
  images: string[] | null;
}

export interface AIFilters {
  sport?: string;
  budgetMin?: number;
  budgetMax?: number;
  radiusKm?: number;
}

export const useAIAdvisor = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (text: string, filters?: AIFilters) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setIsTyping(true);

    // Add user message optimistically
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: {
          message: text,
          conversationId,
          filters,
        },
      });

      if (error) throw error;

      setConversationId(data.conversationId);

      // Add assistant message
      const assistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        recommendations: data.recommendations,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      if (error.message?.includes('Rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message?.includes('credits')) {
        errorMessage = 'AI credits exhausted. Please add credits to continue using the advisor.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      // Remove the optimistic user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
  };

  return { 
    messages, 
    sendMessage, 
    isLoading, 
    isTyping,
    clearConversation,
    conversationId,
  };
};
