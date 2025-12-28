import { Router } from 'preact-router';
import { useState, useEffect, useContext } from 'preact/hooks';
import { AuthProvider, AuthContext } from './services/AuthContext';
import { CartProvider } from './services/CartContext';
import { WebSocketProvider } from './services/WebSocketContext';
import { WishlistProvider } from './services/WishlistContext';
import { AddressProvider } from './services/AddressContext';
import { ChatProvider } from './services/ChatContext';
import { ThemeProvider } from './services/ThemeContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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

// Inner component to access AuthContext
function AppContent() {
  const [route, setRoute] = useState('/');
  const { user } = useContext(AuthContext);

  const handleRoute = (e) => {
    setRoute(e.url);
  };

  // Get role class for background pattern
  const getRoleClass = () => {
    if (!user) return '';
    return `role-${user.role}`;
  };

  return (
    <div class="app">
      <Header currentRoute={route} />
      <main class={`main-content ${getRoleClass()}`}>
        <Router onChange={handleRoute}>
                  <Home path="/" />
                  <Login path="/login" />
                  <Register path="/register" />
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
