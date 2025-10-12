import { describe, it, expect, beforeEach } from 'vitest';
import { useAIConversationStore } from '../aiConversationStore';
import type { AIMessage } from '../aiConversationStore';

describe('aiConversationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAIConversationStore.setState({
      conversations: new Map(),
      activeConversationId: null,
      isLoading: false,
      isTyping: false,
    });
  });

  describe('Conversation Management', () => {
    it('should create a new conversation', () => {
      const { createConversation, getConversationById } = useAIConversationStore.getState();
      
      const id = createConversation('Test Conversation');
      const conversation = getConversationById(id);
      
      expect(conversation).toBeDefined();
      expect(conversation?.title).toBe('Test Conversation');
      expect(conversation?.messages).toEqual([]);
      expect(conversation?.preferences).toBeNull();
    });

    it('should set active conversation', () => {
      const { createConversation, setActiveConversation, activeConversationId } = useAIConversationStore.getState();
      
      const id = createConversation();
      setActiveConversation(id);
      
      expect(useAIConversationStore.getState().activeConversationId).toBe(id);
    });

    it('should delete a conversation', () => {
      const { createConversation, deleteConversation, getConversationById } = useAIConversationStore.getState();
      
      const id = createConversation();
      deleteConversation(id);
      
      expect(getConversationById(id)).toBeNull();
    });

    it('should clear active conversation when deleting active one', () => {
      const { createConversation, deleteConversation } = useAIConversationStore.getState();
      
      const id = createConversation();
      deleteConversation(id);
      
      expect(useAIConversationStore.getState().activeConversationId).toBeNull();
    });
  });

  describe('Message Management', () => {
    it('should add message to conversation', () => {
      const { createConversation, addMessage, getConversationById } = useAIConversationStore.getState();
      
      const conversationId = createConversation();
      const message: AIMessage = {
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      };
      
      addMessage(conversationId, message);
      const conversation = getConversationById(conversationId);
      
      expect(conversation?.messages).toHaveLength(1);
      expect(conversation?.messages[0]).toEqual(message);
    });

    it('should update messages in conversation', () => {
      const { createConversation, updateMessages, getConversationById } = useAIConversationStore.getState();
      
      const conversationId = createConversation();
      const messages: AIMessage[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Hi there!', timestamp: new Date() },
      ];
      
      updateMessages(conversationId, messages);
      const conversation = getConversationById(conversationId);
      
      expect(conversation?.messages).toHaveLength(2);
      expect(conversation?.messages).toEqual(messages);
    });

    it('should update lastActivity when adding message', () => {
      const { createConversation, addMessage, getConversationById } = useAIConversationStore.getState();
      
      const conversationId = createConversation();
      const beforeActivity = getConversationById(conversationId)?.lastActivity;
      
      // Wait a bit to ensure time difference
      setTimeout(() => {
        const message: AIMessage = {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
        };
        
        addMessage(conversationId, message);
        const afterActivity = getConversationById(conversationId)?.lastActivity;
        
        expect(afterActivity!.getTime()).toBeGreaterThan(beforeActivity!.getTime());
      }, 10);
    });
  });

  describe('Preferences Management', () => {
    it('should update conversation preferences', () => {
      const { createConversation, updatePreferences, getConversationById } = useAIConversationStore.getState();
      
      const conversationId = createConversation();
      const preferences = {
        sports: ['football', 'basketball'],
        budgetMin: 1000,
        budgetMax: 5000,
        radiusKm: 50,
      };
      
      updatePreferences(conversationId, preferences);
      const conversation = getConversationById(conversationId);
      
      expect(conversation?.preferences).toEqual(preferences);
    });
  });

  describe('UI State Management', () => {
    it('should set loading state', () => {
      const { setIsLoading } = useAIConversationStore.getState();
      
      setIsLoading(true);
      expect(useAIConversationStore.getState().isLoading).toBe(true);
      
      setIsLoading(false);
      expect(useAIConversationStore.getState().isLoading).toBe(false);
    });

    it('should set typing state', () => {
      const { setIsTyping } = useAIConversationStore.getState();
      
      setIsTyping(true);
      expect(useAIConversationStore.getState().isTyping).toBe(true);
      
      setIsTyping(false);
      expect(useAIConversationStore.getState().isTyping).toBe(false);
    });
  });

  describe('Selectors', () => {
    it('should get active conversation', () => {
      const { createConversation, getActiveConversation } = useAIConversationStore.getState();
      
      const id = createConversation();
      const activeConversation = getActiveConversation();
      
      expect(activeConversation?.id).toBe(id);
    });

    it('should return null when no active conversation', () => {
      const { getActiveConversation } = useAIConversationStore.getState();
      
      expect(getActiveConversation()).toBeNull();
    });

    it('should get all conversations sorted by last activity', () => {
      const { createConversation, addMessage, getAllConversations } = useAIConversationStore.getState();
      
      const id1 = createConversation('First');
      const id2 = createConversation('Second');
      
      // Add message to first conversation (making it more recent)
      addMessage(id1, {
        id: '1',
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
      });
      
      const conversations = getAllConversations();
      
      expect(conversations).toHaveLength(2);
      expect(conversations[0].id).toBe(id1); // Most recent first
      expect(conversations[1].id).toBe(id2);
    });
  });

  describe('Clear Conversation', () => {
    it('should clear messages and preferences', () => {
      const { createConversation, addMessage, updatePreferences, clearConversation, getConversationById } = useAIConversationStore.getState();
      
      const conversationId = createConversation();
      
      addMessage(conversationId, {
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      });
      
      updatePreferences(conversationId, { sports: ['football'] });
      
      clearConversation(conversationId);
      const conversation = getConversationById(conversationId);
      
      expect(conversation?.messages).toHaveLength(0);
      expect(conversation?.preferences).toBeNull();
    });
  });
});
