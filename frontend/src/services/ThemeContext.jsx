import { createContext } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Storage key for persisting theme preference
const THEME_STORAGE_KEY = 'wego-theme-preference';

// Create the context
export const ThemeContext = createContext({
  theme: THEMES.LIGHT,
  effectiveTheme: THEMES.LIGHT,
  setTheme: () => {},
  toggleTheme: () => {},
  isSystemTheme: false
});

/**
 * Theme Provider Component
 * Manages theme state and applies it to the document
 */
export function ThemeProvider({ children }) {
  // Initialize theme from localStorage or default to system
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && Object.values(THEMES).includes(stored)) {
        return stored;
      }
    }
    return THEMES.SYSTEM;
  });

  // Track the effective theme (what's actually displayed)
  const [effectiveTheme, setEffectiveTheme] = useState(THEMES.LIGHT);

  // Get system preference
  const getSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? THEMES.DARK
        : THEMES.LIGHT;
    }
    return THEMES.LIGHT;
  }, []);

  // Calculate and apply effective theme
  useEffect(() => {
    const calculateEffectiveTheme = () => {
      if (theme === THEMES.SYSTEM) {
        return getSystemTheme();
      }
      return theme;
    };

    const newEffectiveTheme = calculateEffectiveTheme();
    setEffectiveTheme(newEffectiveTheme);

    // Apply to document
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newEffectiveTheme);

      // Also update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          newEffectiveTheme === THEMES.DARK ? '#121212' : '#4CAF50'
        );
      }
    }
  }, [theme, getSystemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === THEMES.SYSTEM) {
        const newEffective = getSystemTheme();
        setEffectiveTheme(newEffective);

        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', newEffective);
        }
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme, getSystemTheme]);

  // Set theme and persist to localStorage
  const setTheme = useCallback((newTheme) => {
    if (!Object.values(THEMES).includes(newTheme)) {
      console.warn(`Invalid theme: ${newTheme}`);
      return;
    }

    setThemeState(newTheme);

    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
  }, []);

  // Toggle between light and dark (bypassing system)
  const toggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(newTheme);
  }, [effectiveTheme, setTheme]);

  const value = {
    theme,              // The stored preference (light, dark, or system)
    effectiveTheme,     // What's actually being displayed
    setTheme,           // Set to specific theme
    toggleTheme,        // Quick toggle between light/dark
    isSystemTheme: theme === THEMES.SYSTEM
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook for using theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Need to import useContext for the hook
import { useContext } from 'preact/hooks';
