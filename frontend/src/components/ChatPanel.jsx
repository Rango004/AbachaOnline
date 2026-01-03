import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useChat } from '../services/ChatContext';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';

export default function ChatPanel({ isOpen, onClose, currentUserId, userRole }) {
  const { setActiveConversation, activeConversation } = useChat();
  const [view, setView] = useState('list'); // 'list' or 'thread'

  // Reset to list view when panel closes
  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setActiveConversation(null);
    }
  }, [isOpen]);

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    setView('thread');
  };

  const handleBackToList = () => {
    setView('list');
    setActiveConversation(null);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div class="chat-overlay" style={styles.overlay} onClick={onClose}>
      <div class="chat-panel-enter" style={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} style={styles.closeButton} aria-label="Close chat">
          ✕
        </button>

        {/* Content */}
        {view === 'list' ? (
          <ConversationList
            onSelectConversation={handleSelectConversation}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        ) : (
          <div style={styles.threadContainer}>
            {/* Back button */}
            <button onClick={handleBackToList} style={styles.backButton}>
              ← Back
            </button>
            <MessageThread
              conversation={activeConversation}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    animation: 'fadeIn 0.2s ease-in-out',
    '@media (max-width: 768px)': {
      alignItems: 'flex-end',
      justifyContent: 'center'
    }
  },
  panel: {
    width: '400px',
    height: '600px',
    maxHeight: '90vh',
    backgroundColor: '#fff',
    borderRadius: '12px 12px 0 0',
    boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    animation: 'slideUp 0.3s ease-in-out',
    '@media (max-width: 768px)': {
      width: '100%',
      height: '100vh',
      maxHeight: '100vh',
      borderRadius: 0
    }
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#f5f5f5',
    color: '#757575',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#e0e0e0'
    }
  },
  threadContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative'
  },
  backButton: {
    padding: '12px 16px',
    border: 'none',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    color: '#1976d2',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    textAlign: 'left',
    flexShrink: 0,
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f5f5f5'
    }
  }
};

// CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    #chat-panel {
      width: 100% !important;
      height: 100vh !important;
      max-height: 100vh !important;
      border-radius: 0 !important;
    }
  }
`;
document.head.appendChild(style);
