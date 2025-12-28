import { useContext } from 'preact/hooks';
import { ThemeContext, THEMES } from '../services/ThemeContext';

/**
 * Theme Toggle Component
 * A button that toggles between light and dark themes
 * Shows a moon icon in light mode, sun icon in dark mode
 */
export default function ThemeToggle({ className = '' }) {
  const { effectiveTheme, toggleTheme } = useContext(ThemeContext);

  const isDark = effectiveTheme === THEMES.DARK;

  return (
    <button
      class={`theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        // Sun icon for dark mode (click to switch to light)
        <svg
          class="theme-icon icon-sun"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // Moon icon for light mode (click to switch to dark)
        <svg
          class="theme-icon icon-moon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

/**
 * Theme Toggle with Label
 * A more descriptive version with text label
 */
export function ThemeToggleWithLabel({ className = '' }) {
  const { effectiveTheme, toggleTheme, theme, setTheme, isSystemTheme } = useContext(ThemeContext);

  const isDark = effectiveTheme === THEMES.DARK;

  return (
    <div class={`theme-toggle-container ${className}`}>
      <button
        class="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span class="theme-toggle-track">
          <span class={`theme-toggle-thumb ${isDark ? 'dark' : 'light'}`}>
            {isDark ? '🌙' : '☀️'}
          </span>
        </span>
        <span class="theme-toggle-label">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>

      {/* System preference option */}
      <button
        class={`theme-system-btn ${isSystemTheme ? 'active' : ''}`}
        onClick={() => setTheme(THEMES.SYSTEM)}
        aria-label="Use system theme preference"
      >
        🖥️ System
      </button>
    </div>
  );
}

/**
 * Theme Selector Dropdown
 * Allows selecting between light, dark, and system themes
 */
export function ThemeSelector({ className = '' }) {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div class={`theme-selector ${className}`}>
      <label htmlFor="theme-select" class="theme-selector-label">
        Theme
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        class="theme-selector-dropdown"
      >
        <option value={THEMES.LIGHT}>☀️ Light</option>
        <option value={THEMES.DARK}>🌙 Dark</option>
        <option value={THEMES.SYSTEM}>🖥️ System</option>
      </select>
    </div>
  );
}
