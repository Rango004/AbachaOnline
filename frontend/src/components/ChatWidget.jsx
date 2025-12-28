import { h } from 'preact';
import { useChat } from '../services/ChatContext';
import ChatPanel from './ChatPanel';

/**
 * ChatWidget - Human-to-human messaging (customer-merchant or customer-admin)
 *
 * For ADMINS and MERCHANTS: Always shows a chat button (bottom-right corner)
 * - They need to see and respond to incoming customer messages
 * - When there are unread messages, the button pulses
 *
 * For CUSTOMERS: Hidden by default. Shows only when:
 * 1. User requests "talk to human" from chatbot
 * 2. User clicks "Contact Merchant" on a product
 * 3. There are unread messages (shows a small indicator above chatbot button)
 */
export default function ChatWidget({ currentUserId, userRole }) {
  const { unreadCount, isChatPanelOpen, closeChatPanel, openChatPanel } = useChat();

  // Only show chat for customers, merchants, and admins
  if (!currentUserId || (userRole !== 'customer' && userRole !== 'student' && userRole !== 'merchant' && userRole !== 'admin')) {
    return null;
  }

  // Admins and merchants should always see a chat button (they receive messages from customers)
  const showPersistentChatButton = userRole === 'admin' || userRole === 'merchant';

  return (
    <>
      {/* For admins/merchants: Always show chat button (they need to see incoming customer messages) */}
      {!isChatPanelOpen && showPersistentChatButton && (
        <button
          onClick={openChatPanel}
          class={unreadCount > 0 ? 'chat-pulse' : ''}
          style={{
            ...styles.chatButton,
            ...(unreadCount > 0 ? styles.chatButtonWithUnread : {})
          }}
          aria-label={unreadCount > 0 ? `${unreadCount} unread messages` : 'Open chat'}
          title={unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'Customer messages'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {unreadCount > 0 && (
            <span class={unreadCount > 0 ? 'chat-badge-bounce' : ''} style={styles.unreadBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* For customers: Small unread indicator (only when panel is closed and has unread messages) */}
      {!isChatPanelOpen && !showPersistentChatButton && unreadCount > 0 && (
        <button
          onClick={openChatPanel}
          class="chat-pulse notification-pulse"
          style={styles.unreadIndicator}
          aria-label={`${unreadCount} unread messages`}
          title={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="chat-badge-bounce" style={styles.unreadBadge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </button>
      )}

      {/* Chat Panel - Opens via context (from chatbot or contact merchant) */}
      <ChatPanel
        isOpen={isChatPanelOpen}
        onClose={closeChatPanel}
        currentUserId={currentUserId}
        userRole={userRole}
      />
    </>
  );
}

const styles = {
  // Persistent chat button for admins/merchants - always visible
  chatButton: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9997,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  chatButtonWithUnread: {
    animation: 'pulse-ring 2s infinite',
    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.6)'
  },
  // Small unread indicator for customers - appears above the chatbot button when there are unread messages
  unreadIndicator: {
    position: 'fixed',
    bottom: '150px', // Above the chatbot button
    right: '24px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9997,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'bounceIn 0.5s ease-in-out'
  },
  unreadBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: '#d32f2f',
    color: '#fff',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '700',
    minWidth: '18px',
    textAlign: 'center',
    border: '2px solid #fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    lineHeight: '1.2'
  }
};

// CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.3);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }

  @keyframes bounceIn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes pulse-ring {
    0% {
      box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
    }
  }

  @media (max-width: 768px) {
    #chat-widget-button {
      bottom: 16px;
      right: 16px;
      width: 56px;
      height: 56px;
    }
  }

  @media print {
    #chat-widget-button {
      display: none !important;
    }
  }
`;
document.head.appendChild(style);
