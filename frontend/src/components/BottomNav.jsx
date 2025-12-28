import { useContext } from 'preact/hooks';
import { AuthContext } from '../services/AuthContext';

export default function BottomNav({ currentRoute }) {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const isActive = (path) => currentRoute === path || currentRoute?.startsWith(path) ? 'active' : '';

  // Show different navigation based on user role
  if (user.role === 'admin') {
    return (
      <nav class="bottom-nav">
        <a href="/admin" class={`nav-item ${isActive('/admin')}`}>
          <span class="nav-icon">🔐</span>
          <span>Admin</span>
        </a>
      </nav>
    );
  }

  if (user.role === 'merchant') {
    return (
      <nav class="bottom-nav">
        <a href="/merchant" class={`nav-item ${isActive('/merchant') && currentRoute === '/merchant' ? 'active' : ''}`}>
          <span class="nav-icon">🏠</span>
          <span>Dashboard</span>
        </a>
        <a href="/merchant/products" class={`nav-item ${currentRoute === '/merchant/products' ? 'active' : ''}`}>
          <span class="nav-icon">📦</span>
          <span>Products</span>
        </a>
        <a href="/merchant/orders" class={`nav-item ${currentRoute === '/merchant/orders' ? 'active' : ''}`}>
          <span class="nav-icon">📋</span>
          <span>Orders</span>
        </a>
        <a href="/merchant/predictions" class={`nav-item ${currentRoute === '/merchant/predictions' ? 'active' : ''}`}>
          <span class="nav-icon">📊</span>
          <span>Predictions</span>
        </a>
      </nav>
    );
  }

  // Rider navigation - delivery-focused only
  if (user.role === 'rider') {
    return (
      <nav class="bottom-nav">
        <a href="/rider" class={`nav-item ${isActive('/rider')}`}>
          <span class="nav-icon">🚚</span>
          <span>My Deliveries</span>
        </a>
      </nav>
    );
  }

  // Default navigation for students (6 tabs - For You integrated into Products)
  return (
    <nav class="bottom-nav">
      <a href="/student" class={`nav-item ${isActive('/student')}`}>
        <span class="nav-icon">📊</span>
        <span>Dashboard</span>
      </a>
      <a href="/products" class={`nav-item ${isActive('/products')}`}>
        <span class="nav-icon">🛍️</span>
        <span>Products</span>
      </a>
      <a href="/cart" class={`nav-item ${isActive('/cart')}`}>
        <span class="nav-icon">🛒</span>
        <span>Cart</span>
      </a>
      <a href="/wishlist" class={`nav-item ${isActive('/wishlist')}`}>
        <span class="nav-icon">❤️</span>
        <span>Wishlist</span>
      </a>
      <a href="/orders" class={`nav-item ${isActive('/orders')}`}>
        <span class="nav-icon">📦</span>
        <span>Orders</span>
      </a>
      <a href="/profile" class={`nav-item ${isActive('/profile')}`}>
        <span class="nav-icon">👤</span>
        <span>Profile</span>
      </a>
    </nav>
  );
}
