import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: RecommendationData[];
  timestamp: Date;
}

export interface RecommendationData {
  // Existing RPC fields
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
  
  // NEW FIELDS for OpportunityCard parity
  title: string;
  organization: string;
  city: string;
  state: string;
  players: number;
  tier: string; // TierType from marketplace
  packagesCount: number;
  estWeekly: number;
  durationMonths: number;
  raised: number;
  goal: number;
}

export interface SavedPreferences {
  sports?: string[];
  budgetMin?: number;
  budgetMax?: number;
  radiusKm?: number;
}

export interface Conversation {
  id: string;
  messages: AIMessage[];
  preferences: SavedPreferences | null;
  lastActivity: Date;
  title: string;
  serverConversationId?: string;
}

interface AIConversationState {
  // Multi-conversation state
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  
  // UI state
  isLoading: boolean;
  isTyping: boolean;
  
  // Actions
  setActiveConversation: (id: string | null) => void;
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: AIMessage) => void;
  updateMessages: (conversationId: string, messages: AIMessage[]) => void;
  updatePreferences: (conversationId: string, preferences: SavedPreferences) => void;
  setServerConversationId: (localId: string, serverId: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  clearConversation: (conversationId: string) => void;
  
  // Selectors
  getActiveConversation: () => Conversation | null;
  getConversationById: (id: string) => Conversation | null;
  getAllConversations: () => Conversation[];
}

export const useAIConversationStore = create<AIConversationState>()(
  persist(
    (set, get) => ({
      conversations: new Map(),
      activeConversationId: null,
      isLoading: false,
      isTyping: false,

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      createConversation: (title = 'New Conversation') => {
        const id = crypto.randomUUID();
        const conversation: Conversation = {
          id,
          messages: [],
          preferences: null,
          lastActivity: new Date(),
          title,
        };
        
        set((state) => {
          const newConversations = new Map(state.conversations);
          newConversations.set(id, conversation);
          return {
            conversations: newConversations,
            activeConversationId: id,
          };
        });
        
        return id;
      },

      deleteConversation: (id) => {
        set((state) => {
          const newConversations = new Map(state.conversations);
          newConversations.delete(id);
          
          return {
            conversations: newConversations,
            activeConversationId: 
              state.activeConversationId === id 
                ? null 
                : state.activeConversationId,
          };
        });
      },

      addMessage: (conversationId, message) => {
        set((state) => {
          const conversation = state.conversations.get(conversationId);
          if (!conversation) return state;

          const updatedConversation = {
            ...conversation,
            messages: [...conversation.messages, message],
            lastActivity: new Date(),
          };

          const newConversations = new Map(state.conversations);
          newConversations.set(conversationId, updatedConversation);

          return { conversations: newConversations };
        });
      },

      updateMessages: (conversationId, messages) => {
        set((state) => {
          const conversation = state.conversations.get(conversationId);
          if (!conversation) return state;

          const updatedConversation = {
            ...conversation,
            messages,
            lastActivity: new Date(),
          };

          const newConversations = new Map(state.conversations);
          newConversations.set(conversationId, updatedConversation);

          return { conversations: newConversations };
        });
      },

      updatePreferences: (conversationId, preferences) => {
        set((state) => {
          const conversation = state.conversations.get(conversationId);
          if (!conversation) return state;

          const updatedConversation = {
            ...conversation,
            preferences,
          };

          const newConversations = new Map(state.conversations);
          newConversations.set(conversationId, updatedConversation);

          return { conversations: newConversations };
        });
      },

      setServerConversationId: (localId, serverId) => {
        set((state) => {
          const conversation = state.conversations.get(localId);
          if (!conversation) return state;

          const updatedConversation = {
            ...conversation,
            serverConversationId: serverId,
          };

          const newConversations = new Map(state.conversations);
          newConversations.set(localId, updatedConversation);

          return { conversations: newConversations };
        });
      },

      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsTyping: (typing) => set({ isTyping: typing }),

      clearConversation: (conversationId) => {
        set((state) => {
          const conversation = state.conversations.get(conversationId);
          if (!conversation) return state;

          const clearedConversation = {
            ...conversation,
            messages: [],
            preferences: null,
          };

          const newConversations = new Map(state.conversations);
          newConversations.set(conversationId, clearedConversation);

          return { conversations: newConversations };
        });
      },

      getActiveConversation: () => {
        const state = get();
        if (!state.activeConversationId) return null;
        return state.conversations.get(state.activeConversationId) || null;
      },

      getConversationById: (id) => {
        return get().conversations.get(id) || null;
      },

      getAllConversations: () => {
        return Array.from(get().conversations.values()).sort(
          (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
        );
      },
    }),
    {
      name: 'ai-conversation-storage',
      partialize: (state) => ({
        conversations: Array.from(state.conversations.entries()),
        activeConversationId: state.activeConversationId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.conversations)) {
          state.conversations = new Map(state.conversations as any);
        }
      },
    }
  )
);
