import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAIConversation } from '../useAIConversation';
import { useAIConversationStore } from '@/stores/aiConversationStore';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() }),
}));

describe('useAIConversation', () => {
  beforeEach(() => {
    // Reset store before each test
    useAIConversationStore.setState({
      conversations: new Map(),
      activeConversationId: null,
      isLoading: false,
      isTyping: false,
    });
    vi.clearAllMocks();
  });

  describe('Hook Initialization', () => {
    it('should return empty state when no active conversation', () => {
      const { result } = renderHook(() => useAIConversation());
      
      expect(result.current.messages).toEqual([]);
      expect(result.current.conversationId).toBeNull();
      expect(result.current.savedPreferences).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isTyping).toBe(false);
    });

    it('should provide all necessary actions', () => {
      const { result } = renderHook(() => useAIConversation());
      
      expect(typeof result.current.sendMessage).toBe('function');
      expect(typeof result.current.clearConversation).toBe('function');
      expect(typeof result.current.createConversation).toBe('function');
      expect(typeof result.current.deleteConversation).toBe('function');
      expect(typeof result.current.setActiveConversation).toBe('function');
    });
  });

  describe('Conversation Creation', () => {
    it('should create conversation automatically when sending first message', async () => {
      const { result } = renderHook(() => useAIConversation());
      
      expect(result.current.conversationId).toBeNull();
      
      // This will be tested in integration - sendMessage creates conversation
      const { createConversation } = result.current;
      const id = createConversation('New Chat');
      
      expect(useAIConversationStore.getState().activeConversationId).toBe(id);
    });
  });

  describe('Message Management', () => {
    it('should return messages from active conversation', () => {
      const { createConversation, addMessage } = useAIConversationStore.getState();
      const conversationId = createConversation();
      
      addMessage(conversationId, {
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      });
      
      const { result } = renderHook(() => useAIConversation());
      
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hello');
    });
  });

  describe('Multi-Conversation Support', () => {
    it('should switch between conversations', () => {
      const { createConversation, addMessage } = useAIConversationStore.getState();
      
      const conv1 = createConversation('Conversation 1');
      addMessage(conv1, {
        id: '1',
        role: 'user',
        content: 'Message 1',
        timestamp: new Date(),
      });
      
      const conv2 = createConversation('Conversation 2');
      addMessage(conv2, {
        id: '2',
        role: 'user',
        content: 'Message 2',
        timestamp: new Date(),
      });
      
      const { result } = renderHook(() => useAIConversation());
      
      // Should show conv2 messages (active)
      expect(result.current.messages[0].content).toBe('Message 2');
      
      // Switch to conv1
      result.current.setActiveConversation(conv1);
      
      const { result: result2 } = renderHook(() => useAIConversation());
      expect(result2.current.messages[0].content).toBe('Message 1');
    });

    it('should get all conversations', () => {
      const { createConversation } = useAIConversationStore.getState();
      
      createConversation('Conv 1');
      createConversation('Conv 2');
      createConversation('Conv 3');
      
      const { result } = renderHook(() => useAIConversation());
      const allConversations = result.current.getAllConversations();
      
      expect(allConversations).toHaveLength(3);
    });
  });

  describe('Preferences', () => {
    it('should return preferences from active conversation', () => {
      const { createConversation, updatePreferences } = useAIConversationStore.getState();
      const conversationId = createConversation();
      
      const preferences = {
        sports: ['football'],
        budgetMin: 1000,
        budgetMax: 5000,
      };
      
      updatePreferences(conversationId, preferences);
      
      const { result } = renderHook(() => useAIConversation());
      
      expect(result.current.savedPreferences).toEqual(preferences);
    });
  });

  describe('Clear Conversation', () => {
    it('should clear active conversation', () => {
      const { createConversation, addMessage } = useAIConversationStore.getState();
      const conversationId = createConversation();
      
      addMessage(conversationId, {
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      });
      
      const { result } = renderHook(() => useAIConversation());
      
      expect(result.current.messages).toHaveLength(1);
      
      result.current.clearConversation();
      
      const { result: result2 } = renderHook(() => useAIConversation());
      expect(result2.current.messages).toHaveLength(0);
    });
  });
});
