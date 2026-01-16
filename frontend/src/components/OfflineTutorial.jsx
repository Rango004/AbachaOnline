import { useState, useEffect } from 'preact/hooks';

/**
 * OfflineTutorial Component
 * First-time offline mode education modal
 */
export default function OfflineTutorial({ isOpen, onClose }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: '📡',
      title: "You're Offline",
      content: (
        <div>
          <p>Don't worry! AbachaOL works even without internet.</p>
          <p style={{ marginTop: '12px', color: '#666' }}>
            Most features continue to work, and your changes will sync automatically when you're back online.
          </p>
        </div>
      )
    },
    {
      icon: '✅',
      title: 'What Works Offline',
      content: (
        <ul class="feature-list">
          <li><span class="icon">🛒</span> Browse products (cached)</li>
          <li><span class="icon">📦</span> Place orders (Cash on Delivery only)</li>
          <li><span class="icon">💬</span> Send messages (queued for later)</li>
          <li><span class="icon">❤️</span> View your wishlist</li>
          <li><span class="icon">🗺️</span> View maps (if tiles are cached)</li>
          <li><span class="icon">📋</span> View order history</li>
        </ul>
      )
    },
    {
      icon: '🔄',
      title: 'Automatic Sync',
      content: (
        <div>
          <p>Your changes sync automatically when you're back online.</p>
          <div class="sync-visual">
            <div class="sync-item">
              <span class="badge offline">📋 Queued</span>
              <span class="arrow">→</span>
              <span class="badge syncing">🔄 Syncing</span>
              <span class="arrow">→</span>
              <span class="badge synced">✅ Done</span>
            </div>
          </div>
          <p style={{ marginTop: '12px', color: '#666', fontSize: '13px' }}>
            Look for the connectivity badge at the bottom-right to check sync status.
          </p>
        </div>
      )
    },
    {
      icon: '💡',
      title: 'Pro Tips',
      content: (
        <ul class="tips-list">
          <li>
            <strong>Download campus map</strong>
            <p>Go to Settings → Download Map for offline navigation</p>
          </li>
          <li>
            <strong>Check sync status</strong>
            <p>Tap the connectivity badge to see pending operations</p>
          </li>
          <li>
            <strong>Queued items</strong>
            <p>Look for the 📋 icon to identify items waiting to sync</p>
          </li>
          <li>
            <strong>Clear storage</strong>
            <p>If running low on space, clear old cached data in Settings</p>
          </li>
        </ul>
      )
    }
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div class="offline-tutorial-overlay" onClick={handleSkip}>
      <div class="offline-tutorial-modal" onClick={(e) => e.stopPropagation()}>
        {/* Progress dots */}
        <div class="tutorial-progress">
          {steps.map((_, i) => (
            <span
              key={i}
              class={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        {/* Content */}
        <div class="tutorial-content">
          <div class="tutorial-icon">{steps[step].icon}</div>
          <h2>{steps[step].title}</h2>
          <div class="tutorial-body">{steps[step].content}</div>
        </div>

        {/* Navigation */}
        <div class="tutorial-nav">
          <button class="btn-skip" onClick={handleSkip}>
            Skip
          </button>

          <div class="nav-buttons">
            {step > 0 && (
              <button class="btn-prev" onClick={handlePrev}>
                ← Back
              </button>
            )}
            <button class="btn-next" onClick={handleNext}>
              {step === steps.length - 1 ? "Got it!" : "Next →"}
            </button>
          </div>
        </div>

        <style>{`
          .offline-tutorial-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            padding: 20px;
            animation: fadeIn 0.3s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .offline-tutorial-modal {
            background: white;
            border-radius: 16px;
            width: 100%;
            max-width: 400px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
          }

          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .tutorial-progress {
            display: flex;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            background: #f5f5f5;
          }

          .progress-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ddd;
            cursor: pointer;
            transition: all 0.3s;
          }

          .progress-dot.active {
            background: #2196f3;
            transform: scale(1.2);
          }

          .progress-dot.completed {
            background: #4caf50;
          }

          .tutorial-content {
            padding: 24px;
            text-align: center;
          }

          .tutorial-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .tutorial-content h2 {
            margin: 0 0 16px 0;
            font-size: 22px;
            color: #333;
          }

          .tutorial-body {
            text-align: left;
            color: #555;
            line-height: 1.5;
          }

          .tutorial-body p {
            margin: 0;
          }

          .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .feature-list li {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
          }

          .feature-list li:last-child {
            border-bottom: none;
          }

          .feature-list .icon {
            font-size: 18px;
          }

          .sync-visual {
            background: #f5f5f5;
            padding: 16px;
            border-radius: 8px;
            margin-top: 12px;
          }

          .sync-item {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .sync-item .badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }

          .sync-item .badge.offline {
            background: #fff3e0;
            color: #e65100;
          }

          .sync-item .badge.syncing {
            background: #e3f2fd;
            color: #1565c0;
          }

          .sync-item .badge.synced {
            background: #e8f5e9;
            color: #2e7d32;
          }

          .sync-item .arrow {
            color: #999;
          }

          .tips-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .tips-list li {
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
          }

          .tips-list li:last-child {
            border-bottom: none;
          }

          .tips-list li strong {
            color: #333;
            font-size: 14px;
            display: block;
            margin-bottom: 4px;
          }

          .tips-list li p {
            margin: 0;
            font-size: 13px;
            color: #666;
          }

          .tutorial-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            background: #f9f9f9;
            border-top: 1px solid #eee;
          }

          .nav-buttons {
            display: flex;
            gap: 8px;
          }

          .btn-skip {
            background: none;
            border: none;
            color: #999;
            font-size: 14px;
            cursor: pointer;
            padding: 8px;
          }

          .btn-skip:hover {
            color: #666;
          }

          .btn-prev,
          .btn-next {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-prev {
            background: #f0f0f0;
            color: #333;
          }

          .btn-prev:hover {
            background: #e0e0e0;
          }

          .btn-next {
            background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
            color: white;
          }

          .btn-next:hover {
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
          }

          @media (max-width: 480px) {
            .offline-tutorial-overlay {
              padding: 16px;
            }

            .tutorial-content {
              padding: 20px;
            }

            .tutorial-icon {
              font-size: 40px;
            }

            .tutorial-content h2 {
              font-size: 20px;
            }

            .feature-list li,
            .tips-list li strong {
              font-size: 13px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
