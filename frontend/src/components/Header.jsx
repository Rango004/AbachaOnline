import { useContext, useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../services/AuthContext';
import { CartContext } from '../services/CartContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';

export default function Header({ currentRoute }) {
  const { user, logout } = useContext(AuthContext);
  const { getItemCount } = useContext(CartContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentRoute]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get navigation items based on user role
  const getDesktopNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin' },
        ];
      case 'merchant':
        return [
          { label: 'Dashboard', path: '/merchant' },
          { label: 'Products', path: '/merchant/products' },
          { label: 'Orders', path: '/merchant/orders' },
          { label: 'Analytics', path: '/merchant/analytics' },
        ];
      case 'rider':
        return [
          { label: 'Deliveries', path: '/rider' },
        ];
      default: // student
        return [
          { label: 'Dashboard', path: '/student' },
          { label: 'Products', path: '/products' },
          { label: 'Orders', path: '/orders' },
          { label: 'Profile', path: '/profile' },
        ];
    }
  };

  return (
    <>
      <header class={`header ${isScrolled ? 'scrolled' : ''}`}>
        <a href="/" class="logo" onClick={(e) => { e.preventDefault(); route('/'); }}>
          AbachaOnline 🛍️
        </a>
        
        {/* Desktop Navigation */}
        {user && (
          <nav class="desktop-nav">
            {getDesktopNavItems().map(item => (
              <a 
                key={item.path}
                href={item.path} 
                class={`desktop-nav-item ${currentRoute === item.path ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); route(item.path); }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
        
        <div class="header-actions">
          {user && (
            <>
              <span class="user-name">
                {user.role === 'admin' && '🔐 '}
                {user.role === 'rider' && '🚚 '}
                {user.role === 'merchant' && '🏪 '}
                {user.name}
              </span>
              {user.role === 'student' && (
                <a href="/cart" class="cart-icon">
                  🛒 {getItemCount() > 0 && <span class="badge">{getItemCount()}</span>}
                </a>
              )}
              <NotificationBell />
            </>
          )}
          <ThemeToggle />
          {user && (
            <>
              <button onClick={logout} class="btn-logout">Logout</button>
              {/* Hamburger menu button for mobile */}
              <button
                class={`hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div class="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {user && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          currentRoute={currentRoute}
        />
      )}
    </>
  );
}
