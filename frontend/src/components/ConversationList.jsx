import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useChat } from '../services/ChatContext';

export default function ConversationList({ onSelectConversation, currentUserId, userRole }) {
  const { conversations, loading, error, unreadCount } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const otherParty = conv.merchant_name || conv.customer_name || '';
    const productName = conv.product_name || '';
    const query = searchQuery.toLowerCase();

    return (
      otherParty.toLowerCase().includes(query) ||
      productName.toLowerCase().includes(query)
    );
  });

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';

    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return '';
    }
  };

  const getUnreadBadge = (conv) => {
    // Determine if this user is customer or merchant in this conversation
    const isCustomer = conv.customer_id === currentUserId;
    const unreadForMe = isCustomer ? conv.customer_unread_count : conv.merchant_unread_count;

    return unreadForMe || 0;
  };

  if (loading && conversations.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Messages</h2>
          {unreadCount > 0 && (
            <span style={styles.totalBadge}>{unreadCount}</span>
          )}
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Messages</h2>
        </div>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    // Different empty state messages for different roles
    const isAdminOrMerchant = userRole === 'admin' || userRole === 'merchant';
    const emptySubtitle = isAdminOrMerchant
      ? 'Customer messages will appear here when they reach out'
      : 'Start a conversation by clicking "Ask Merchant" on any product';

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Messages</h2>
        </div>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <p style={styles.emptyTitle}>No conversations yet</p>
          <p style={styles.emptySubtitle}>{emptySubtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Messages</h2>
        {unreadCount > 0 && (
          <span style={styles.totalBadge}>{unreadCount}</span>
        )}
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onInput={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Conversations List */}
      <div style={styles.conversationsList}>
        {filteredConversations.length === 0 ? (
          <div style={styles.noResults}>
            <p style={styles.noResultsText}>No conversations match "{searchQuery}"</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const unreadCount = getUnreadBadge(conv);
            const hasUnread = unreadCount > 0;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                style={{
                  ...styles.conversationItem,
                  ...(hasUnread && styles.conversationItemUnread)
                }}
              >
                {/* Avatar */}
                <div style={styles.avatar}>
                  {(conv.merchant_name || conv.customer_name || 'U')[0].toUpperCase()}
                </div>

                {/* Conversation Info */}
                <div style={styles.conversationInfo}>
                  <div style={styles.conversationHeader}>
                    <span style={{
                      ...styles.conversationName,
                      ...(hasUnread && styles.conversationNameUnread)
                    }}>
                      {conv.merchant_name || conv.customer_name}
                    </span>
                    {conv.last_message_at && (
                      <span style={styles.timestamp}>
                        {formatLastMessageTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>

                  {conv.product_name && (
                    <p style={styles.productTag}>
                      📦 {conv.product_name}
                    </p>
                  )}

                  {conv.last_message && (
                    <div style={styles.lastMessageRow}>
                      <p style={{
                        ...styles.lastMessage,
                        ...(hasUnread && styles.lastMessageUnread)
                      }}>
                        {conv.last_message.sender_id === currentUserId && 'You: '}
                        {conv.last_message.message_text.length > 50
                          ? conv.last_message.message_text.substring(0, 50) + '...'
                          : conv.last_message.message_text}
                      </p>
                      {hasUnread && (
                        <span style={styles.unreadBadge}>{unreadCount}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#fff'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #e0e0e0',
    flexShrink: 0
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#212121'
  },
  totalBadge: {
    backgroundColor: '#d32f2f',
    color: '#fff',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '20px',
    textAlign: 'center'
  },
  searchContainer: {
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
    flexShrink: 0
  },
  searchInput: {
    width: '100%',
    padding: '10px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  },
  conversationsList: {
    flex: 1,
    overflowY: 'auto'
  },
  conversationItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f5f5f5'
    }
  },
  conversationItemUnread: {
    backgroundColor: '#e3f2fd'
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#1976d2',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    flexShrink: 0
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  conversationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px'
  },
  conversationName: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#212121',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  conversationNameUnread: {
    fontWeight: '600'
  },
  timestamp: {
    fontSize: '12px',
    color: '#757575',
    flexShrink: 0
  },
  productTag: {
    margin: 0,
    fontSize: '12px',
    color: '#1976d2',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  lastMessageRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px'
  },
  lastMessage: {
    margin: 0,
    fontSize: '13px',
    color: '#757575',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1
  },
  lastMessageUnread: {
    color: '#212121',
    fontWeight: '500'
  },
  unreadBadge: {
    backgroundColor: '#d32f2f',
    color: '#fff',
    borderRadius: '10px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '18px',
    textAlign: 'center',
    flexShrink: 0
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '40px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #1976d2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '16px',
    color: '#757575',
    fontSize: '14px'
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '40px'
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '14px',
    textAlign: 'center'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '40px',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#212121'
  },
  emptySubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#757575',
    maxWidth: '300px'
  },
  noResults: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  noResultsText: {
    color: '#757575',
    fontSize: '14px',
    textAlign: 'center'
  }
};

// CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
