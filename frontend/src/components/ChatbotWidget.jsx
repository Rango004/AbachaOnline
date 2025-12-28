import { h } from 'preact';
import { useState, useEffect, useRef, useContext, useCallback } from 'preact/hooks';
import { AuthContext } from '../services/AuthContext';
import { WebSocketContext } from '../services/WebSocketContext';
import { ChatContext } from '../services/ChatContext';
import api from '../services/api';

export default function ChatbotWidget() {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(WebSocketContext);
  const chatContext = useContext(ChatContext);

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnectingToHuman, setIsConnectingToHuman] = useState(false);

  const messagesEndRef = useRef(null);

  // Only show for customers/students
  if (!user || (user.role !== 'customer' && user.role !== 'student')) {
    return null;
  }

  // Initialize chatbot session when opened
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeSession();
    }
  }, [isOpen]);

  // Handle escalation to human chat - defined as useCallback to ensure fresh context in socket listener
  const handleEscalation = useCallback(async (escalationData) => {
    if (!chatContext) {
      console.error('[Chatbot] Chat context not available');
      return;
    }

    setIsConnectingToHuman(true);

    try {
      // Check escalation type
      if (escalationData?.type === 'merchant' && escalationData?.merchantId) {
        // Connect to specific merchant (for refunds)
        await chatContext.openChatWithMerchant(escalationData.merchantId, escalationData.productId);
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: '✅ Connected! Opening chat with merchant...',
          timestamp: new Date(),
          intent: 'system'
        }]);
      } else {
        // Connect to admin support
        await chatContext.openAdminSupport();
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: '✅ Connected! Opening chat with support...',
          timestamp: new Date(),
          intent: 'system'
        }]);
      }

      // Minimize chatbot after successful connection
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);

    } catch (error) {
      console.error('[Chatbot] Error connecting to human:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: '❌ Sorry, I couldn\'t connect you to support right now. Please try again later or contact us directly.',
        timestamp: new Date(),
        intent: 'error'
      }]);
    } finally {
      setIsConnectingToHuman(false);
    }
  }, [chatContext]);

  // Listen for WebSocket chatbot messages
  useEffect(() => {
    if (!socket) return;

    const handleChatbotMessage = (data) => {
      console.log('[Chatbot] Received message:', data);

      // Add the message to chat
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.message_text,
        timestamp: data.timestamp,
        intent: data.intent,
        confidence: data.confidence,
        escalation: data.escalation // Contains escalation info if present
      }]);

      // Check for escalation intent - automatically connect to human
      if (data.intent === 'talk_to_human' || data.escalation) {
        handleEscalation(data.escalation);
      }
    };

    socket.on('chatbot:message', handleChatbotMessage);

    return () => {
      socket.off('chatbot:message', handleChatbotMessage);
    };
  }, [socket, handleEscalation]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/chatbot/sessions');

      if (response.data.success) {
        setSessionId(response.data.session.session_id);

        // Check if we have existing messages from the last 2 days
        if (response.data.isExistingSession && response.data.messages?.length > 0) {
          // Convert database messages to UI format
          const existingMessages = response.data.messages.map(msg => ({
            sender: msg.sender,
            text: msg.message_text,
            timestamp: new Date(msg.created_at),
            intent: msg.intent || null,
            confidence: msg.confidence || null
          }));

          // Add a welcome back message
          setMessages([
            ...existingMessages,
            {
              sender: 'bot',
              text: 'Welcome back! I\'ve loaded your previous conversation. How can I help you today?',
              timestamp: new Date(),
              intent: 'greet'
            }
          ]);
          console.log('[Chatbot] Loaded', existingMessages.length, 'previous messages');
        } else {
          // New session - show welcome message
          setMessages([{
            sender: 'bot',
            text: 'Hello! Welcome to AbachaOnline. How can I help you today?',
            timestamp: new Date(),
            intent: 'greet'
          }]);
        }
      }
    } catch (error) {
      console.error('[Chatbot] Error initializing session:', error);
      setMessages([{
        sender: 'bot',
        text: 'Sorry, I\'m having trouble connecting. Please try again later.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!inputText.trim() || isSending || !sessionId) {
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Add user message immediately
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    }]);

    try {
      const response = await api.post(`/chatbot/sessions/${sessionId}/messages`, {
        messageText: userMessage
      });

      // Bot response will come via WebSocket - don't add it here to avoid duplicates
      // The WebSocket listener will handle displaying the bot response

    } catch (error) {
      console.error('[Chatbot] Error sending message:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickAction = async (actionText) => {
    setInputText(actionText);
    // Trigger send
    setTimeout(() => {
      const form = document.getElementById('chatbot-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  // Handle special chat action links
  const handleChatLink = async (linkType, merchantId = null) => {
    if (!chatContext) {
      console.error('[Chatbot] Chat context not available');
      return;
    }

    setIsConnectingToHuman(true);
    try {
      if (linkType === 'merchant' && merchantId) {
        await chatContext.openChatWithMerchant(parseInt(merchantId));
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: '✅ Opening chat with merchant...',
          timestamp: new Date(),
          intent: 'system'
        }]);
      } else if (linkType === 'admin') {
        await chatContext.openAdminSupport();
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: '✅ Opening chat with AbachaOnline Admin...',
          timestamp: new Date(),
          intent: 'system'
        }]);
      }
      // Minimize chatbot after connection
      setTimeout(() => setIsOpen(false), 1000);
    } catch (error) {
      console.error('[Chatbot] Error opening chat:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: '❌ Sorry, could not connect. Please try again.',
        timestamp: new Date(),
        intent: 'error'
      }]);
    } finally {
      setIsConnectingToHuman(false);
    }
  };

  // Convert markdown links [text](url) to clickable HTML
  const parseMarkdownLinks = (text) => {
    if (!text) return text;

    // Regular expression to match markdown links: [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let linkIndex = 0;

    while ((match = markdownLinkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${linkIndex}`}>{text.substring(lastIndex, match.index)}</span>);
      }

      // Add the clickable link
      const linkText = match[1];
      const linkUrl = match[2];

      // Check for special chat action links
      if (linkUrl === '#chat-admin') {
        parts.push(
          <button
            key={`link-${linkIndex}`}
            style={styles.chatActionButton}
            onClick={() => handleChatLink('admin')}
            disabled={isConnectingToHuman}
          >
            {linkText}
          </button>
        );
      } else if (linkUrl.startsWith('#chat-merchant-')) {
        const merchantId = linkUrl.replace('#chat-merchant-', '');
        parts.push(
          <button
            key={`link-${linkIndex}`}
            style={styles.chatActionButton}
            onClick={() => handleChatLink('merchant', merchantId)}
            disabled={isConnectingToHuman}
          >
            {linkText}
          </button>
        );
      } else {
        // Regular link
        parts.push(
          <a
            key={`link-${linkIndex}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.messageLink}
            onClick={(e) => {
              // If it's an internal link, use client-side navigation
              if (linkUrl.startsWith('/')) {
                e.preventDefault();
                window.location.href = linkUrl;
              }
            }}
          >
            {linkText}
          </a>
        );
      }

      lastIndex = match.index + match[0].length;
      linkIndex++;
    }

    // Add remaining text after last link
    if (lastIndex < text.length) {
      parts.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
    }

    // If no links found, return original text
    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChatbot}
          style={styles.floatingButton}
          aria-label="Open chatbot"
        >
          <span style={styles.robotIcon}>🤖</span>
        </button>
      )}

      {/* Chatbot Panel */}
      {isOpen && (
        <div class="chatbot-pop-in" style={styles.chatbotPanel}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerInfo}>
              <span style={styles.robotAvatar}>🤖</span>
              <div>
                <h3 style={styles.headerTitle}>AbachaOnline Assistant</h3>
                <p style={styles.headerSubtitle}>Ask me anything</p>
              </div>
            </div>
            <button onClick={toggleChatbot} style={styles.closeButton} aria-label="Close chatbot">
              ✕
            </button>
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div style={styles.quickActions}>
              <p style={styles.quickActionsTitle}>Quick Actions:</p>
              <div style={styles.quickButtonsContainer}>
                <button
                  onClick={() => handleQuickAction('Check my order status')}
                  style={styles.quickButton}
                  disabled={isSending}
                >
                  📦 Check Order
                </button>
                <button
                  onClick={() => handleQuickAction('Search for products')}
                  style={styles.quickButton}
                  disabled={isSending}
                >
                  🔍 Find Products
                </button>
                <button
                  onClick={() => handleQuickAction('How long is delivery?')}
                  style={styles.quickButton}
                  disabled={isSending}
                >
                  🚚 Delivery Time
                </button>
                <button
                  onClick={() => handleQuickAction('Talk to a human')}
                  style={styles.quickButton}
                  disabled={isSending}
                >
                  💬 Human Support
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={styles.messagesContainer}>
            {isLoading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Connecting to assistant...</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.messageRow,
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {msg.sender === 'bot' && (
                      <div style={styles.botAvatar}>🤖</div>
                    )}
                    <div
                      style={{
                        ...styles.messageBubble,
                        ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble)
                      }}
                    >
                      <p style={styles.messageText}>{parseMarkdownLinks(msg.text)}</p>
                      <span style={styles.messageTime}>{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div style={styles.typingIndicator}>
                    <div style={styles.botAvatar}>🤖</div>
                    <div style={styles.typingBubble}>
                      <span style={styles.typingDot}></span>
                      <span style={{ ...styles.typingDot, animationDelay: '0.2s' }}></span>
                      <span style={{ ...styles.typingDot, animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form id="chatbot-form" onSubmit={sendMessage} style={styles.inputContainer}>
            <input
              type="text"
              value={inputText}
              onInput={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              style={styles.input}
              disabled={isSending || isLoading || !sessionId}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending || isLoading || !sessionId}
              style={{
                ...styles.sendButton,
                ...((!inputText.trim() || isSending || isLoading || !sessionId) && styles.sendButtonDisabled)
              }}
            >
              {isSending ? '...' : '➤'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

const styles = {
  floatingButton: {
    position: 'fixed',
    bottom: '80px',
    right: '24px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#9c27b0',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    transition: 'all 0.3s ease',
    zIndex: 9998,
    ':hover': {
      transform: 'scale(1.1)',
      boxShadow: '0 6px 16px rgba(156, 39, 176, 0.5)'
    }
  },
  robotIcon: {
    fontSize: '32px',
    lineHeight: 1
  },
  chatbotPanel: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '380px',
    height: '600px',
    maxHeight: '80vh',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9998,
    animation: 'slideUp 0.3s ease-out',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: '#9c27b0',
    color: '#fff',
    borderRadius: '16px 16px 0 0',
    flexShrink: 0
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  robotAvatar: {
    fontSize: '32px',
    lineHeight: 1
  },
  headerTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600'
  },
  headerSubtitle: {
    margin: '2px 0 0 0',
    fontSize: '12px',
    opacity: 0.9
  },
  closeButton: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  },
  quickActions: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
    flexShrink: 0
  },
  quickActionsTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#616161'
  },
  quickButtonsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px'
  },
  quickButton: {
    padding: '10px 12px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
    color: '#424242'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#fafafa'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #9c27b0',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '16px',
    color: '#757575',
    fontSize: '14px'
  },
  messageRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end'
  },
  botAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#9c27b0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0
  },
  messageBubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '16px',
    wordBreak: 'break-word'
  },
  userBubble: {
    backgroundColor: '#9c27b0',
    color: '#fff',
    borderBottomRightRadius: '4px'
  },
  botBubble: {
    backgroundColor: '#fff',
    color: '#212121',
    borderBottomLeftRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  messageText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap'
  },
  messageLink: {
    color: '#1976d2',
    textDecoration: 'underline',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'color 0.2s',
    ':hover': {
      color: '#1565c0'
    }
  },
  chatActionButton: {
    display: 'inline-block',
    backgroundColor: '#9c27b0',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '4px 4px 4px 0',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(156, 39, 176, 0.3)'
  },
  messageTime: {
    display: 'block',
    marginTop: '4px',
    fontSize: '11px',
    opacity: 0.7
  },
  typingIndicator: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end'
  },
  typingBubble: {
    backgroundColor: '#fff',
    padding: '12px 16px',
    borderRadius: '16px',
    borderBottomLeftRadius: '4px',
    display: 'flex',
    gap: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  typingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#9e9e9e',
    animation: 'typing 1.4s infinite',
    display: 'inline-block'
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e0e0e0',
    flexShrink: 0
  },
  input: {
    flex: 1,
    padding: '10px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  sendButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#9c27b0',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
    cursor: 'not-allowed',
    opacity: 0.6
  }
};

// CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
    30% { transform: translateY(-10px); opacity: 1; }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
