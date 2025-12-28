import { h, createContext } from 'preact';
import { useState, useEffect, useContext, useCallback } from 'preact/hooks';
import { WebSocketContext } from './WebSocketContext';
import api from './api';

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const webSocketContext = useContext(WebSocketContext);
  const { socket, isConnected } = webSocketContext || { socket: null, isConnected: false };

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({}); // { conversationId: [messages] }
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState({}); // { conversationId: boolean }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chat panel visibility control - hidden by default
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

  // =====================================================
  // WEBSOCKET EVENT HANDLERS
  // =====================================================

  const handleIncomingMessage = useCallback((message) => {
    console.log('[Chat] Incoming message:', message);

    // Update messages for the conversation
    setMessages(prev => {
      const conversationId = message.conversation_id;
      const existing = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: [...existing, message]
      };
    });

    // Update conversation's last message
    setConversations(prev => prev.map(conv => {
      if (conv.id === message.conversation_id) {
        return {
          ...conv,
          last_message: {
            message_text: message.message_text,
            message_type: message.message_type,
            created_at: message.created_at,
            sender_id: message.sender_id
          },
          last_message_at: message.created_at
        };
      }
      return conv;
    }));

    // Play notification sound (optional)
    // playNotificationSound();
  }, []);

  const handleTypingIndicator = useCallback((data) => {
    console.log('[Chat] Typing indicator:', data);
    const { conversation_id, is_typing } = data;

    setIsTyping(prev => ({
      ...prev,
      [conversation_id]: is_typing
    }));

    // Clear typing indicator after 3 seconds if still typing
    if (is_typing) {
      setTimeout(() => {
        setIsTyping(prev => ({
          ...prev,
          [conversation_id]: false
        }));
      }, 3000);
    }
  }, []);

  const handleUnreadUpdate = useCallback((data) => {
    console.log('[Chat] Unread count update:', data);
    setUnreadCount(data.unread_count || 0);
  }, []);

  // Register WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('chat:message', handleIncomingMessage);
    socket.on('chat:typing', handleTypingIndicator);
    socket.on('chat:unread_update', handleUnreadUpdate);

    return () => {
      socket.off('chat:message', handleIncomingMessage);
      socket.off('chat:typing', handleTypingIndicator);
      socket.off('chat:unread_update', handleUnreadUpdate);
    };
  }, [socket, handleIncomingMessage, handleTypingIndicator, handleUnreadUpdate]);

  // =====================================================
  // CONVERSATION OPERATIONS
  // =====================================================

  /**
   * Load all conversations for current user
   */
  const loadConversations = useCallback(async (limit = 20) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/chat/conversations?limit=${limit}`);

      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (err) {
      console.error('[Chat] Error loading conversations:', err);
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Start or get conversation with merchant
   */
  const createConversation = useCallback(async (merchantId, productId = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/chat/conversations', {
        merchantId,
        productId
      });

      if (response.data.success) {
        const conversation = response.data.conversation;

        // Add to conversations list if not already present
        setConversations(prev => {
          const exists = prev.find(c => c.id === conversation.id);
          if (exists) return prev;
          return [conversation, ...prev];
        });

        return conversation;
      }
    } catch (err) {
      console.error('[Chat] Error creating conversation:', err);
      setError(err.response?.data?.message || 'Failed to create conversation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // MESSAGE OPERATIONS
  // =====================================================

  /**
   * Load messages for a conversation
   */
  const loadMessages = useCallback(async (conversationId, limit = 50, offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
      );

      if (response.data.success) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: response.data.messages
        }));
      }
    } catch (err) {
      console.error('[Chat] Error loading messages:', err);
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send a message in a conversation
   */
  const sendMessage = useCallback(async (conversationId, messageText, messageType = 'text', metadata = {}) => {
    if (!messageText || messageText.trim().length === 0) {
      return;
    }

    try {
      const response = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        {
          messageText: messageText.trim(),
          messageType,
          metadata
        }
      );

      if (response.data.success) {
        const message = response.data.message;

        // Add message to local state immediately (optimistic update)
        setMessages(prev => {
          const existing = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: [...existing, message]
          };
        });

        // Update conversation's last message
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              last_message: {
                message_text: message.message_text,
                message_type: message.message_type,
                created_at: message.created_at,
                sender_id: message.sender_id
              },
              last_message_at: message.created_at
            };
          }
          return conv;
        }));

        return message;
      }
    } catch (err) {
      console.error('[Chat] Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
      throw err;
    }
  }, []);

  /**
   * Load unread message count
   */
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/chat/unread-count');

      if (response.data.success) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      console.error('[Chat] Error loading unread count:', err);
    }
  }, []);

  /**
   * Mark conversation as read
   */
  const markAsRead = useCallback(async (conversationId) => {
    try {
      const response = await api.patch(`/chat/conversations/${conversationId}/read`);

      if (response.data.success) {
        // Update local messages to mark as read
        setMessages(prev => {
          const conversationMessages = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: conversationMessages.map(msg => ({
              ...msg,
              is_read: true
            }))
          };
        });

        // Reload unread count from server
        await loadUnreadCount();
      }
    } catch (err) {
      console.error('[Chat] Error marking as read:', err);
    }
  }, [loadUnreadCount]);

  /**
   * Send typing indicator
   */
  const sendTypingIndicator = useCallback(async (conversationId, isTyping) => {
    try {
      await api.post(`/chat/conversations/${conversationId}/typing`, {
        isTyping
      });
    } catch (err) {
      console.error('[Chat] Error sending typing indicator:', err);
    }
  }, []);

  /**
   * Delete a message
   */
  const deleteMessage = useCallback(async (messageId, conversationId) => {
    try {
      const response = await api.delete(`/chat/messages/${messageId}`);

      if (response.data.success) {
        // Remove message from local state
        setMessages(prev => {
          const conversationMessages = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: conversationMessages.filter(msg => msg.id !== messageId)
          };
        });
      }
    } catch (err) {
      console.error('[Chat] Error deleting message:', err);
      throw err;
    }
  }, []);

  // =====================================================
  // CHAT PANEL CONTROL - For integration with chatbot
  // =====================================================

  /**
   * Open chat panel (called from chatbot or contact merchant button)
   */
  const openChatPanel = useCallback(() => {
    setIsChatPanelOpen(true);
  }, []);

  /**
   * Close chat panel
   */
  const closeChatPanel = useCallback(() => {
    setIsChatPanelOpen(false);
    setActiveConversation(null);
  }, []);

  /**
   * Open chat with a specific merchant (and optionally about a product)
   * Used by "Contact Merchant" button and chatbot escalation
   */
  const openChatWithMerchant = useCallback(async (merchantId, productId = null) => {
    try {
      const conversation = await createConversation(merchantId, productId);
      setActiveConversation(conversation);
      setIsChatPanelOpen(true);
      return conversation;
    } catch (err) {
      console.error('[Chat] Error opening chat with merchant:', err);
      throw err;
    }
  }, [createConversation]);

  /**
   * Open chat for admin support (connects to first available admin)
   * Used by chatbot "talk to human" for general support
   */
  const openAdminSupport = useCallback(async () => {
    try {
      // Fetch admin user ID from backend
      const response = await api.get('/chat/support-admin');
      if (response.data.success && response.data.adminId) {
        const conversation = await createConversation(response.data.adminId);
        setActiveConversation(conversation);
        setIsChatPanelOpen(true);
        return conversation;
      } else {
        console.error('[Chat] No admin available for support');
        throw new Error('No support admin available');
      }
    } catch (err) {
      console.error('[Chat] Error opening admin support:', err);
      throw err;
    }
  }, [createConversation]);

  // =====================================================
  // AUTO-LOAD ON MOUNT
  // =====================================================

  useEffect(() => {
    // Load conversations and unread count when component mounts
    if (isConnected) {
      loadConversations();
      loadUnreadCount();
    }
  }, [isConnected, loadConversations, loadUnreadCount]);

  // Auto-load messages when active conversation changes
  useEffect(() => {
    if (activeConversation && !messages[activeConversation.id]) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation, messages, loadMessages]);

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = {
    // State
    conversations,
    activeConversation,
    messages,
    unreadCount,
    isTyping,
    loading,
    error,
    isChatPanelOpen,

    // Conversation methods
    loadConversations,
    createConversation,
    setActiveConversation,

    // Message methods
    loadMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
    sendTypingIndicator,

    // Unread count
    loadUnreadCount,

    // Chat panel control (for chatbot integration)
    openChatPanel,
    closeChatPanel,
    openChatWithMerchant,
    openAdminSupport
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook for using chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
