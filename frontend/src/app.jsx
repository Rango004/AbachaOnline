import { Router } from 'preact-router';
import { useState, useEffect, useContext, useMemo } from 'preact/hooks';
import { AuthProvider, AuthContext } from './services/AuthContext';
import { CartProvider } from './services/CartContext';
import { WebSocketProvider } from './services/WebSocketContext';
import { WishlistProvider } from './services/WishlistContext';
import { AddressProvider } from './services/AddressContext';
import { ChatProvider } from './services/ChatContext';
import { ThemeProvider } from './services/ThemeContext';
import OfflineSync from './services/OfflineSyncService';
import { getNetworkStatus, watchNetworkStatus } from './services/NativeBridge';
import PushNotificationService from './services/PushNotificationService';

// Offline UI Components
import ConnectivityBadge from './components/ConnectivityBadge';
import ConflictResolver from './components/ConflictResolver';
import OfflineTutorial from './components/OfflineTutorial';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import TokenTopup from './pages/TokenTopup';
import Notifications from './pages/Notifications';
import StudentDashboard from './pages/student/Dashboard';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import Wishlist from './pages/Wishlist';
import DeliveryAddresses from './pages/DeliveryAddresses';

// Merchant Pages
import MerchantDashboard from './pages/merchant/Dashboard';
import MerchantProducts from './pages/merchant/Products';
import MerchantOrders from './pages/merchant/Orders';
import MerchantPayouts from './pages/merchant/Payouts';
import MerchantSettings from './pages/merchant/Settings';
import MerchantPredictions from './pages/merchant/Predictions';
import MerchantAnalytics from './pages/merchant/Analytics';

// Rider Pages
import RiderDashboard from './pages/rider/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminRefunds from './pages/admin/Refunds';

// Components
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ChatWidget from './components/ChatWidget';
import ChatbotWidget from './components/ChatbotWidget';

/**
 * SyncManager - Adapter for OfflineSync to work with ConnectivityBadge
 */
class SyncManager {
  constructor() {
    this.listeners = new Set();
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.pendingCount = 0;
    this.pendingOperations = [];
    this.checkInterval = null;

    // Initialize offline DB and do initial connectivity check
    OfflineSync.initOfflineDB().then(async () => {
      this.refreshStatus();
      // Do an initial connectivity check
      await this.checkConnectivity();
    });

    // Subscribe to OfflineSync events
    OfflineSync.onSyncEvent((event) => {
      this.handleSyncEvent(event);
    });

    // Watch network status changes
    watchNetworkStatus(({ connected }) => {
      const wasOnline = this.isOnline;
      this.isOnline = connected;
      if (wasOnline !== connected) {
        console.log(`[SyncManager] Network status changed: ${connected ? 'ONLINE' : 'OFFLINE'}`);
        this.notifyListeners({ type: connected ? 'online' : 'offline' });
      }
    });

    // Start periodic connectivity checks (every 30 seconds)
    // This catches network changes that browser events might miss
    this.startPeriodicCheck();
  }

  /**
   * Perform an actual connectivity check
   */
  async checkConnectivity() {
    try {
      // Bypass cache for periodic checks to ensure fresh status
      const status = await getNetworkStatus(true);
      const wasOnline = this.isOnline;
      this.isOnline = status.connected;

      if (wasOnline !== status.connected) {
        console.log(`[SyncManager] Connectivity check: ${status.connected ? 'ONLINE' : 'OFFLINE'}`);
        this.notifyListeners({ type: status.connected ? 'online' : 'offline' });
      }
    } catch (error) {
      console.error('[SyncManager] Connectivity check failed:', error);
    }
  }

  /**
   * Start periodic connectivity checks
   */
  startPeriodicCheck() {
    // Check every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkConnectivity();
    }, 30000);
  }

  /**
   * Stop periodic checks (for cleanup)
   */
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  handleSyncEvent(event) {
    switch (event.type) {
      case 'syncStart':
        this.isSyncing = true;
        this.notifyListeners({ type: 'sync-start', count: event.count });
        break;
      case 'syncComplete':
        this.isSyncing = false;
        this.refreshStatus();
        this.notifyListeners({
          type: 'sync-complete',
          successCount: event.successCount,
          failureCount: event.failCount,
          pendingCount: this.pendingCount
        });
        break;
      case 'queued':
        this.refreshStatus();
        this.notifyListeners({ type: 'operation-queued', operationId: event.id });
        break;
      case 'syncSuccess':
        this.notifyListeners({ type: 'operation-synced', operationId: event.id });
        break;
      case 'syncFailed':
        this.notifyListeners({ type: 'operation-sync-failed', operationId: event.id, error: event.error });
        break;
      default:
        // Forward other events
        this.notifyListeners(event);
    }
  }

  async refreshStatus() {
    try {
      this.pendingCount = await OfflineSync.getPendingSyncCount();
      const failed = await OfflineSync.getFailedSyncRequests();
      const pending = await OfflineSync.db?.getAllFromIndex?.('syncQueue', 'status', 'pending') || [];
      this.pendingOperations = [...pending, ...failed].map(op => ({
        id: op.id,
        type: op.method,
        endpoint: op.url,
        createdAt: op.timestamp,
        retries: op.retries || 0,
        status: op.status
      }));
    } catch (error) {
      console.error('[SyncManager] Failed to refresh status:', error);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[SyncManager] Listener error:', error);
      }
    });
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.pendingCount,
      pendingOperations: this.pendingOperations
    };
  }

  async syncQueue() {
    await OfflineSync.processPendingSync();
  }

  async clearQueue() {
    await OfflineSync.db?.clear?.('syncQueue');
    this.pendingCount = 0;
    this.pendingOperations = [];
    this.notifyListeners({ type: 'queue-cleared' });
  }
}

// Create singleton SyncManager instance
const syncManager = new SyncManager();

// Inner component to access AuthContext
function AppContent() {
  const [route, setRoute] = useState('/');
  const { user } = useContext(AuthContext);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineTutorial, setShowOfflineTutorial] = useState(false);

  useEffect(() => {
    // Watch network status for offline banner and tutorial
    const unsubscribe = watchNetworkStatus(({ connected }) => {
      setIsOffline(!connected);

      // Show tutorial on first offline experience
      if (!connected) {
        const hasSeenTutorial = localStorage.getItem('offline_tutorial_seen');
        if (!hasSeenTutorial && user) {
          setShowOfflineTutorial(true);
        }
      }
    });
    return unsubscribe;
  }, [user]);

  // Initialize push notifications when user logs in
  useEffect(() => {
    if (user) {
      PushNotificationService.initialize().catch(err => {
        console.error('[App] Push notification initialization failed:', err);
      });
    } else {
      // Cleanup when user logs out
      PushNotificationService.cleanup().catch(err => {
        console.error('[App] Push notification cleanup failed:', err);
      });
    }
  }, [user]);

  const handleRoute = (e) => {
    setRoute(e.url);
  };

  // Get role class for background pattern
  const getRoleClass = () => {
    if (!user) return '';
    return `role-${user.role}`;
  };

  const handleConflictResolved = (conflictId, strategy) => {
    console.log(`[App] Conflict ${conflictId} resolved with strategy: ${strategy}`);
  };

  const handleCloseTutorial = () => {
    localStorage.setItem('offline_tutorial_seen', 'true');
    setShowOfflineTutorial(false);
  };

  return (
    <div class="app">
      {/* Global Offline Banner */}
      {isOffline && (
        <div class="offline-banner">
          <span>📡 You're offline. Changes will sync when you're back online.</span>
        </div>
      )}

      <Header currentRoute={route} />
      <main class={`main-content ${getRoleClass()} ${isOffline ? 'offline-mode' : ''}`}>
        <Router onChange={handleRoute}>
                  <Home path="/" />
                  <Login path="/login" />
                  <Register path="/register" />
                  <ForgotPassword path="/forgot-password" />
                  <Products path="/products" />
                  <Cart path="/cart" />
                  <Checkout path="/checkout" />
                  <Orders path="/orders" />
                  <OrderDetail path="/orders/:id" />
                  <TokenTopup path="/tokens" />
                  <Notifications path="/notifications" />
                  <StudentDashboard path="/student" />
                  <Recommendations path="/recommendations" />
                  <Wishlist path="/wishlist" />
                  <DeliveryAddresses path="/addresses" />
                  <Profile path="/profile" />

                {/* Merchant Routes */}
                <MerchantDashboard path="/merchant" />
                <MerchantProducts path="/merchant/products" />
                <MerchantOrders path="/merchant/orders" />
                <MerchantPayouts path="/merchant/payouts" />
                <MerchantSettings path="/merchant/settings" />
                <MerchantPredictions path="/merchant/predictions" />
                <MerchantAnalytics path="/merchant/analytics" />

                {/* Rider Routes */}
                <RiderDashboard path="/rider" />

          {/* Admin Routes */}
          <AdminDashboard path="/admin" />
          <AdminRefunds path="/admin/refunds" />
        </Router>
      </main>
      <BottomNav currentRoute={route} />

      {/* Chat Widget - For customers, merchants, and admins */}
      {user && <ChatWidget currentUserId={user.id} userRole={user.role} />}

      {/* Chatbot Widget - AI assistant for customers only */}
      {user && <ChatbotWidget />}

      {/* Connectivity Badge - Shows sync status */}
      {user && <ConnectivityBadge syncManager={syncManager} />}

      {/* Conflict Resolver - Handles sync conflicts */}
      {user && <ConflictResolver onConflictResolved={handleConflictResolved} />}

      {/* Offline Tutorial - First-time offline education */}
      <OfflineTutorial isOpen={showOfflineTutorial} onClose={handleCloseTutorial} />

      {/* Offline Banner Styles */}
      <style>{`
        .offline-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
          color: white;
          text-align: center;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          z-index: 2001;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }

        .offline-mode {
          padding-top: 36px; /* Account for offline banner */
        }

        /* Adjust header when offline banner is shown */
        .app:has(.offline-banner) .header {
          top: 36px;
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .offline-banner {
            font-size: 12px;
            padding: 6px 12px;
          }
          .offline-mode {
            padding-top: 32px;
          }
          .app:has(.offline-banner) .header {
            top: 32px;
          }
        }
      `}</style>
    </div>
  );
}

// Main App component with all providers
export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AddressProvider>
            <WishlistProvider>
              <WebSocketProvider>
                <ChatProvider>
                  <AppContent />
                </ChatProvider>
              </WebSocketProvider>
            </WishlistProvider>
          </AddressProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
