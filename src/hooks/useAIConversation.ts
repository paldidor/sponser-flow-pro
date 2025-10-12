import { useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAIConversationStore } from '@/stores/aiConversationStore';
import type { AIMessage, RecommendationData, SavedPreferences } from '@/stores/aiConversationStore';

export interface AIFilters {
  sport?: string;
  budgetMin?: number;
  budgetMax?: number;
  radiusKm?: number;
}

export const useAIConversation = () => {
  const {
    activeConversationId,
    isLoading,
    isTyping,
    setActiveConversation,
    createConversation,
    deleteConversation,
    addMessage,
    updateMessages,
    updatePreferences,
    setServerConversationId,
    setIsLoading,
    setIsTyping,
    clearConversation,
    getActiveConversation,
    getConversationById,
    getAllConversations,
  } = useAIConversationStore();

  const activeConversation = getActiveConversation();

  const sendMessage = async (text: string, filters?: AIFilters) => {
    if (!text.trim()) return;

    // Create conversation if none exists
    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = createConversation();
    }

    setIsLoading(true);
    setIsTyping(true);

    // Add user message optimistically
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    addMessage(conversationId, userMessage);

    try {
      // Use server conversation ID if available, otherwise use local ID
      const targetId = activeConversation?.serverConversationId || conversationId;
      
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: {
          message: text,
          conversationId: targetId,
          filters,
        },
      });

      if (error) throw error;

      // Store server conversation ID if returned and different from stored
      if (data.conversationId && data.conversationId !== activeConversation?.serverConversationId) {
        setServerConversationId(conversationId, data.conversationId);
      }

      // Load preferences if this is a new conversation
      if (data.conversationId && !activeConversation?.preferences) {
        loadPreferences(conversationId, data.conversationId);
      }

      // Add assistant message
      const assistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        recommendations: data.recommendations,
        timestamp: new Date(),
      };
      addMessage(conversationId, assistantMessage);

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
      const conversation = getConversationById(conversationId);
      if (conversation) {
        updateMessages(
          conversationId,
          conversation.messages.slice(0, -1)
        );
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const loadPreferences = async (localConvId: string, serverConvId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('metadata')
        .eq('id', serverConvId)
        .single();

      if (!error && data?.metadata) {
        const metadata = data.metadata as Record<string, any>;
        if (metadata.preferences) {
          updatePreferences(localConvId, metadata.preferences);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Load conversation from database on mount
  useEffect(() => {
    const loadConversationFromDB = async () => {
      if (!activeConversationId) return;

      const conversation = getConversationById(activeConversationId);
      if (!conversation || conversation.messages.length > 0) return;

      try {
        // Use server conversation ID if available, otherwise use local ID
        const remoteId = conversation.serverConversationId || activeConversationId;

        // Load messages with recommendations
        const { data: messagesData, error } = await supabase
          .from('ai_messages')
          .select(`
            *,
            ai_recommendations (
              sponsorship_offer_id,
              package_id,
              recommendation_reason,
              user_action,
              recommendation_data
            )
          `)
          .eq('conversation_id', remoteId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (messagesData && messagesData.length > 0) {
          // Transform messages to include recommendations from database
          const transformedMessages: AIMessage[] = messagesData.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
            recommendations: msg.ai_recommendations
              ?.map((rec: any) => {
                const data = rec.recommendation_data;
                if (!data) return null;
                
                // Add fallback values for backward compatibility with old recommendations
                return {
                  ...data,
                  estWeekly: data.estWeekly ?? 0,
                  packagesCount: data.packagesCount ?? 1,
                  players: data.players ?? 0,
                  city: data.city ?? 'Unknown',
                  state: data.state ?? 'Unknown',
                  durationMonths: data.durationMonths ?? 6,
                  tier: data.tier ?? 'Local',
                  raised: data.raised ?? 0,
                  goal: data.goal ?? data.price ?? 0,
                  title: data.title ?? data.team_name,
                  organization: data.organization ?? data.team_name,
                };
              })
              .filter((data: any) => data != null) || undefined,
          }));

          updateMessages(activeConversationId, transformedMessages);
        }

        // Load preferences using correct IDs
        await loadPreferences(activeConversationId, remoteId);
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    loadConversationFromDB();
  }, [activeConversationId]);

  return {
    // State
    messages: activeConversation?.messages || [],
    conversationId: activeConversationId,
    savedPreferences: activeConversation?.preferences || null,
    isLoading,
    isTyping,
    
    // Single conversation actions
    sendMessage,
    clearConversation: () => {
      if (activeConversationId) {
        clearConversation(activeConversationId);
      }
    },
    loadPreferences,
    
    // Multi-conversation actions
    setActiveConversation,
    createConversation,
    deleteConversation,
    getAllConversations,
    getConversationById,
  };
};

// Re-export types for backward compatibility
export type { AIMessage, RecommendationData, SavedPreferences };
