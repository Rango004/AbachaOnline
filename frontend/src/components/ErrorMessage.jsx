import { useState, useEffect } from 'preact/hooks';

export default function ErrorMessage({ error, onDismiss, autoHide = true, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(!!error);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          if (onDismiss) onDismiss();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHide, duration, onDismiss]);

  if (!error || !isVisible) return null;

  return (
    <div class="error-message">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{error}</span>
        {onDismiss && (
          <button 
            class="error-dismiss" 
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}