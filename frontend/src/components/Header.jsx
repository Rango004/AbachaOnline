import { useContext, useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../services/AuthContext';
import { CartContext } from '../services/CartContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

export default function Header({ currentRoute }) {
  const { user, logout } = useContext(AuthContext);
  const { getItemCount } = useContext(CartContext);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header class={`header ${isScrolled ? 'scrolled' : ''}`}>
      <a href="/" class="logo" onClick={(e) => { e.preventDefault(); route('/'); }}>
        AbachaOnline 🛍️
      </a>
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
          <button onClick={logout} class="btn-logout">Logout</button>
        )}
      </div>
    </header>
  );
}
