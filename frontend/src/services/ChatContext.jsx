import { h, createContext } from 'preact';
import { useState, useEffect, useContext, useCallback } from 'preact/hooks';
import { WebSocketContext } from './WebSocketContext';
import api from './api';
import OfflineSync from './OfflineSyncService';
import { getNetworkStatus } from './NativeBridge';

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

  // Handle single message read receipt
  const handleMessageReadReceipt = useCallback((data) => {
    console.log('[Chat] Message read receipt:', data);
    const { message_id, conversation_id, read_at } = data;

    setMessages(prev => {
      const conversationMessages = prev[conversation_id] || [];
      return {
        ...prev,
        [conversation_id]: conversationMessages.map(msg =>
          msg.id === message_id ? { ...msg, is_read: true, read_at } : msg
        )
      };
    });
  }, []);

  // Handle multiple messages read receipt
  const handleMessagesReadReceipt = useCallback((data) => {
    console.log('[Chat] Messages read receipt:', data);
    const { conversation_id, message_ids, read_at } = data;

    if (!message_ids || !Array.isArray(message_ids)) return;

    setMessages(prev => {
      const conversationMessages = prev[conversation_id] || [];
      return {
        ...prev,
        [conversation_id]: conversationMessages.map(msg =>
          message_ids.includes(msg.id) ? { ...msg, is_read: true, read_at } : msg
        )
      };
    });
  }, []);

  // Register WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('chat:message', handleIncomingMessage);
    socket.on('chat:typing', handleTypingIndicator);
    socket.on('chat:unread_update', handleUnreadUpdate);
    socket.on('chat:message_read_receipt', handleMessageReadReceipt);
    socket.on('chat:messages_read_receipt', handleMessagesReadReceipt);

    return () => {
      socket.off('chat:message', handleIncomingMessage);
      socket.off('chat:typing', handleTypingIndicator);
      socket.off('chat:unread_update', handleUnreadUpdate);
      socket.off('chat:message_read_receipt', handleMessageReadReceipt);
      socket.off('chat:messages_read_receipt', handleMessagesReadReceipt);
    };
  }, [socket, handleIncomingMessage, handleTypingIndicator, handleUnreadUpdate, handleMessageReadReceipt, handleMessagesReadReceipt]);

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
   * Load messages for a conversation (with offline cache support)
   */
  const loadMessages = useCallback(async (conversationId, limit = 50, offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const { connected } = await getNetworkStatus();

      if (!connected) {
        // Load from cache when offline
        console.log('[Chat] Offline - loading cached messages');
        const cachedMessages = await OfflineSync.getCachedMessages(conversationId);

        if (cachedMessages && cachedMessages.length > 0) {
          setMessages(prev => ({
            ...prev,
            [conversationId]: cachedMessages
          }));
        }

        return;
      }

      // Load from server when online
      const response = await api.get(
        `/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
      );

      if (response.data.success) {
        const serverMessages = response.data.messages;

        // Cache messages for offline access
        // Note: Individual messages are cached by queueMessage, this caches the full conversation
        setMessages(prev => ({
          ...prev,
          [conversationId]: serverMessages
        }));
      }
    } catch (err) {
      console.error('[Chat] Error loading messages:', err);

      // Try loading from cache on error
      try {
        const cachedMessages = await OfflineSync.getCachedMessages(conversationId);
        if (cachedMessages && cachedMessages.length > 0) {
          console.log('[Chat] Loading from cache after error');
          setMessages(prev => ({
            ...prev,
            [conversationId]: cachedMessages
          }));
        }
      } catch (cacheErr) {
        console.error('[Chat] Failed to load from cache:', cacheErr);
      }

      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send a message in a conversation (with offline support)
   */
  const sendMessage = useCallback(async (conversationId, messageText, messageType = 'text', metadata = {}) => {
    if (!messageText || messageText.trim().length === 0) {
      return;
    }

    // Check network status
    const { connected } = await getNetworkStatus();

    // Generate client-side UUID for deduplication
    const clientUuid = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const messageData = {
      message_text: messageText.trim(),
      message_type: messageType,
      metadata,
      clientUuid,
      timestamp: Date.now(),
      status: connected ? 'sending' : 'queued'
    };

    // Optimistic update - add to UI immediately
    const tempMessage = {
      id: clientUuid, // Temporary ID
      conversation_id: conversationId,
      message_text: messageText.trim(),
      message_type: messageType,
      metadata,
      clientUuid,
      created_at: new Date().toISOString(),
      status: messageData.status,
      sender_id: 'current_user' // Will be updated with real sender_id from server
    };

    setMessages(prev => {
      const existing = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: [...existing, tempMessage]
      };
    });

    if (!connected) {
      // Queue for sync when back online
      console.log('[Chat] Offline - queuing message');
      await OfflineSync.queueMessage(conversationId, messageData);

      // Update conversation's last message
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            last_message: {
              message_text: tempMessage.message_text,
              message_type: tempMessage.message_type,
              created_at: tempMessage.created_at,
              sender_id: tempMessage.sender_id
            },
            last_message_at: tempMessage.created_at
          };
        }
        return conv;
      }));

      return { ...tempMessage, queued: true };
    }

    // Send immediately if online
    try {
      const response = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        {
          messageText: messageText.trim(),
          messageType,
          metadata,
          clientUuid // Send UUID to prevent duplicates
        }
      );

      if (response.data.success) {
        const message = response.data.message;

        // Update message with server ID and status
        setMessages(prev => {
          const existing = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: existing.map(msg =>
              msg.clientUuid === clientUuid
                ? { ...message, status: 'sent' }
                : msg
            )
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

      // If network error, queue the message
      if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        console.log('[Chat] Network error - queuing message');
        await OfflineSync.queueMessage(conversationId, messageData);

        // Update message status to 'queued'
        setMessages(prev => {
          const existing = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: existing.map(msg =>
              msg.clientUuid === clientUuid
                ? { ...msg, status: 'queued' }
                : msg
            )
          };
        });

        return { ...tempMessage, queued: true };
      }

      // Mark message as failed
      setMessages(prev => {
        const existing = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: existing.map(msg =>
            msg.clientUuid === clientUuid
              ? { ...msg, status: 'failed' }
              : msg
          )
        };
      });

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

  /**
   * Retry a failed message
   */
  const retryMessage = useCallback(async (conversationId, clientUuid) => {
    try {
      // Find the failed message
      const conversationMessages = messages[conversationId] || [];
      const failedMessage = conversationMessages.find(msg => msg.clientUuid === clientUuid);

      if (!failedMessage) {
        console.error('[Chat] Failed message not found:', clientUuid);
        return;
      }

      // Update status to 'sending'
      setMessages(prev => {
        const existing = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: existing.map(msg =>
            msg.clientUuid === clientUuid
              ? { ...msg, status: 'sending' }
              : msg
          )
        };
      });

      // Try sending again
      const response = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        {
          messageText: failedMessage.message_text,
          messageType: failedMessage.message_type,
          metadata: failedMessage.metadata || {},
          clientUuid
        }
      );

      if (response.data.success) {
        const message = response.data.message;

        // Update with server response
        setMessages(prev => {
          const existing = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: existing.map(msg =>
              msg.clientUuid === clientUuid
                ? { ...message, status: 'sent' }
                : msg
            )
          };
        });

        return message;
      }
    } catch (err) {
      console.error('[Chat] Error retrying message:', err);

      // Mark as failed again
      setMessages(prev => {
        const existing = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: existing.map(msg =>
            msg.clientUuid === clientUuid
              ? { ...msg, status: 'failed' }
              : msg
          )
        };
      });

      throw err;
    }
  }, [messages]);

  /**
   * Sync pending messages when back online
   */
  const syncPendingMessages = useCallback(async () => {
    try {
      console.log('[Chat] Syncing pending messages...');
      const result = await OfflineSync.syncMessages();

      if (result.success && result.synced > 0) {
        console.log(`[Chat] Synced ${result.synced} messages`);

        // Reload all conversations to get fresh data
        await loadConversations();

        // Reload active conversation messages
        if (activeConversation) {
          await loadMessages(activeConversation.id);
        }
      }

      return result;
    } catch (err) {
      console.error('[Chat] Error syncing messages:', err);
      throw err;
    }
  }, [loadConversations, activeConversation, loadMessages]);

  /**
   * Get pending message count
   */
  const getPendingMessageCount = useCallback(async () => {
    try {
      const pendingMessages = await OfflineSync.getCachedMessages();
      return pendingMessages.filter(msg => msg.syncStatus === 'pending').length;
    } catch (err) {
      console.error('[Chat] Error getting pending count:', err);
      return 0;
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

  // Auto-sync pending messages when coming back online
  useEffect(() => {
    let networkStatusUnsubscribe;

    const setupNetworkListener = async () => {
      networkStatusUnsubscribe = await OfflineSync.onSyncEvent((event) => {
        if (event.type === 'networkChange' && event.connected) {
          console.log('[Chat] Back online - syncing pending messages');
          syncPendingMessages().catch(err => {
            console.error('[Chat] Auto-sync failed:', err);
          });
        }
      });
    };

    setupNetworkListener();

    return () => {
      if (networkStatusUnsubscribe) {
        networkStatusUnsubscribe();
      }
    };
  }, [syncPendingMessages]);

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

    // Offline support methods
    retryMessage,
    syncPendingMessages,
    getPendingMessageCount,

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
