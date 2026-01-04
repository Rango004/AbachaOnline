import { useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../services/AuthContext';

export default function MobileMenu({ isOpen, onClose, currentRoute }) {
  const { user, logout } = useContext(AuthContext);

  const handleNavigation = (path) => {
    // Handle admin dashboard tab navigation
    if (path === '/admin' && user?.role === 'admin') {
      route('/admin');
    } else if (path.startsWith('/admin/tab/')) {
      // Extract tab name from path like /admin/tab/merchants
      const tab = path.split('/admin/tab/')[1];
      route('/admin');
      // Set tab in localStorage for admin dashboard to read
      localStorage.setItem('adminActiveTab', tab);
      // Trigger a custom event to notify admin dashboard
      window.dispatchEvent(new CustomEvent('adminTabChange', { detail: { tab } }));
    } else {
      route(path);
    }
    onClose();
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      onClose();
    }
  };

  const getRoleDisplayName = (role) => {
    if (role === 'student') return 'Customer';
    return role?.charAt(0).toUpperCase() + role?.slice(1);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '🔐';
      case 'merchant': return '🏪';
      case 'rider': return '🚚';
      default: return '👤';
    }
  };

  // Menu items based on user role
  const getMenuItems = () => {
    if (!user) return [];

    const commonItems = [
      { icon: '👤', label: 'Profile', path: '/profile' },
      { icon: '🔔', label: 'Notifications', path: '/notifications' },
    ];

    switch (user.role) {
      case 'admin':
        return [
          { icon: '📊', label: 'Dashboard', path: '/admin' },
          { icon: '📈', label: 'Analytics', path: '/admin/tab/analytics' },
          { icon: '🏪', label: 'Merchants', path: '/admin/tab/merchants' },
          { icon: '🚚', label: 'Riders', path: '/admin/tab/riders' },
          { icon: '👥', label: 'Customers', path: '/admin/tab/customers' },
          { icon: '📦', label: 'Orders', path: '/admin/tab/orders' },
          { icon: '⚙️', label: 'Settings', path: '/admin/tab/settings' },
          { divider: true },
          ...commonItems,
          { icon: '🔒', label: 'Change Password', path: '/profile', action: 'password' },
        ];
      case 'merchant':
        return [
          { icon: '📊', label: 'Dashboard', path: '/merchant/dashboard' },
          { icon: '📦', label: 'Products', path: '/merchant/products' },
          { icon: '📋', label: 'Orders', path: '/merchant/orders' },
          { icon: '📈', label: 'Predictions', path: '/merchant/predictions' },
          { icon: '💰', label: 'Payouts', path: '/merchant/payouts' },
          { icon: '⚙️', label: 'Settings', path: '/merchant/settings' },
          { divider: true },
          ...commonItems,
          { icon: '🔒', label: 'Change Password', path: '/profile', action: 'password' },
        ];
      case 'rider':
        return [
          { icon: '📊', label: 'Dashboard', path: '/rider/dashboard' },
          { icon: '🚚', label: 'My Deliveries', path: '/rider/deliveries' },
          { icon: '💵', label: 'Earnings', path: '/rider/earnings' },
          { divider: true },
          ...commonItems,
          { icon: '🔒', label: 'Change Password', path: '/profile', action: 'password' },
        ];
      default: // student/customer
        return [
          { icon: '📊', label: 'Dashboard', path: '/student/dashboard' },
          { icon: '🛍️', label: 'Products', path: '/products' },
          { icon: '🛒', label: 'Cart', path: '/cart' },
          { icon: '❤️', label: 'Wishlist', path: '/wishlist' },
          { icon: '📦', label: 'Orders', path: '/orders' },
          { icon: '🎟️', label: 'Token Credits', path: '/tokens' },
          { divider: true },
          ...commonItems,
          { icon: '🔒', label: 'Change Password', path: '/profile', action: 'password' },
        ];
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Overlay */}
      <div
        class={`mobile-menu-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div class={`mobile-menu ${isOpen ? 'active' : ''}`}>
        {/* Header with user info */}
        <div class="mobile-menu-header">
          <div class="mobile-menu-user">
            <div class="mobile-menu-avatar">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div class="mobile-menu-info">
              <h3>{user.name}</h3>
              <span class="role-badge">
                {getRoleIcon(user.role)} {getRoleDisplayName(user.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav class="mobile-menu-nav">
          {getMenuItems().map((item, index) => {
            if (item.divider) {
              return <div key={index} class="mobile-menu-divider" />;
            }
            return (
              <button
                key={index}
                class={`mobile-menu-item ${currentRoute === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <span class="mobile-menu-item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer with logout */}
        <div class="mobile-menu-footer">
          <button class="btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}
