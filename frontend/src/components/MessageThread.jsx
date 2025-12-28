import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useChat } from '../services/ChatContext';

export default function MessageThread({ conversation, currentUserId }) {
  const { messages, isTyping, sendMessage, markAsRead, sendTypingIndicator } = useChat();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const conversationMessages = messages[conversation?.id] || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages.length]);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (conversation && conversationMessages.length > 0) {
      markAsRead(conversation.id);
    }
  }, [conversation?.id]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversation?.id]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageText(value);

    // Send typing indicator
    if (value.length > 0) {
      sendTypingIndicator(conversation.id, true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(conversation.id, false);
      }, 3000);
    } else {
      sendTypingIndicator(conversation.id, false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || sending) {
      return;
    }

    try {
      setSending(true);
      await sendMessage(conversation.id, messageText);
      setMessageText('');
      sendTypingIndicator(conversation.id, false);

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const timeStr = `${displayHours}:${minutes} ${ampm}`;

    if (diffInHours < 24) {
      return timeStr;
    } else if (diffInHours < 48) {
      return 'Yesterday ' + timeStr;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${timeStr}`;
    }
  };

  if (!conversation) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>💬</div>
        <p style={styles.emptyText}>Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <h3 style={styles.headerTitle}>
            {conversation.merchant_name || conversation.customer_name}
          </h3>
          {conversation.product_name && (
            <p style={styles.headerSubtitle}>About: {conversation.product_name}</p>
          )}
        </div>
      </div>

      {/* Product Context Card (if product-specific) */}
      {conversation.product_id && conversation.product_name && (
        <div style={styles.productCard}>
          {conversation.product_image && (
            <img
              src={conversation.product_image}
              alt={conversation.product_name}
              style={styles.productImage}
            />
          )}
          <div style={styles.productInfo}>
            <p style={styles.productName}>{conversation.product_name}</p>
            <p style={styles.productLabel}>Discussing this product</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {conversationMessages.length === 0 ? (
          <div style={styles.noMessages}>
            <p style={styles.noMessagesText}>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          <>
            {conversationMessages.map((msg, index) => {
              const isSentByMe = msg.sender_id === currentUserId;
              const showAvatar = index === 0 || conversationMessages[index - 1].sender_id !== msg.sender_id;

              return (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageRow,
                    justifyContent: isSentByMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  {!isSentByMe && showAvatar && (
                    <div style={styles.avatar}>
                      {(msg.sender_name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  {!isSentByMe && !showAvatar && <div style={styles.avatarSpacer} />}

                  <div
                    style={{
                      ...styles.messageBubble,
                      ...(isSentByMe ? styles.messageBubbleSent : styles.messageBubbleReceived)
                    }}
                  >
                    {!isSentByMe && showAvatar && (
                      <p style={styles.senderName}>{msg.sender_name}</p>
                    )}
                    <p style={styles.messageText}>{msg.message_text}</p>
                    <div style={styles.messageFooter}>
                      <span style={styles.messageTime}>
                        {formatMessageTime(msg.created_at)}
                      </span>
                      {isSentByMe && msg.is_read && (
                        <span style={styles.readReceipt}>✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping[conversation.id] && (
              <div style={styles.typingIndicator}>
                <div style={styles.avatar}>...</div>
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

      {/* Message Input */}
      <form onSubmit={handleSendMessage} style={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={messageText}
          onInput={handleInputChange}
          placeholder="Type a message..."
          style={styles.input}
          maxLength={5000}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!messageText.trim() || sending}
          style={{
            ...styles.sendButton,
            ...((!messageText.trim() || sending) && styles.sendButtonDisabled)
          }}
        >
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#f8f9fa'
  },
  header: {
    padding: '16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    flexShrink: 0
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  headerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#212121'
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#757575'
  },
  productCard: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#fff3cd',
    borderBottom: '1px solid #ffeaa7',
    alignItems: 'center',
    flexShrink: 0
  },
  productImage: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  productInfo: {
    flex: 1
  },
  productName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#856404'
  },
  productLabel: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#856404',
    opacity: 0.8
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  noMessages: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  noMessagesText: {
    color: '#9e9e9e',
    fontSize: '14px'
  },
  messageRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1976d2',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    flexShrink: 0
  },
  avatarSpacer: {
    width: '32px',
    flexShrink: 0
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10px 14px',
    borderRadius: '18px',
    wordBreak: 'break-word'
  },
  messageBubbleSent: {
    backgroundColor: '#1976d2',
    color: '#fff',
    borderBottomRightRadius: '4px'
  },
  messageBubbleReceived: {
    backgroundColor: '#fff',
    color: '#212121',
    borderBottomLeftRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  senderName: {
    margin: '0 0 4px 0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#1976d2'
  },
  messageText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap'
  },
  messageFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px'
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7
  },
  readReceipt: {
    fontSize: '12px',
    color: '#4fc3f7'
  },
  typingIndicator: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end'
  },
  typingBubble: {
    backgroundColor: '#fff',
    padding: '12px 16px',
    borderRadius: '18px',
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
    backgroundColor: '#1976d2',
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
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#f8f9fa'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyText: {
    color: '#9e9e9e',
    fontSize: '16px'
  }
};

// CSS animation for typing indicator
const style = document.createElement('style');
style.textContent = `
  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
    30% { transform: translateY(-10px); opacity: 1; }
  }
`;
document.head.appendChild(style);
