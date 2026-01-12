import { createContext } from 'preact';
import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { route } from 'preact-router';
import api from './api';
import { Capacitor } from '@capacitor/core';
import PushNotificationService from './PushNotificationService';

export const AuthContext = createContext();

// Detect if running on mobile platform
const isMobilePlatform = Capacitor.isNativePlatform();

// Inactivity timeout in milliseconds
// Mobile: 7 days (more convenient for users)
// Web: 10 minutes (more secure)
const INACTIVITY_TIMEOUT = isMobilePlatform ? 7 * 24 * 60 * 60 * 1000 : 10 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);
  const isLoggingOutRef = useRef(false);

  // Function to handle automatic logout due to inactivity
  const handleInactivityLogout = useCallback(() => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    console.log('[Auth] Session expired due to inactivity');
    api.setToken(null);
    setUser(null);
    setToken(null);

    // Show a message to the user
    alert('Your session has expired due to inactivity. Please log in again.');

    route('/');
    isLoggingOutRef.current = false;
  }, []);

  // Function to reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Only run if user is logged in
    if (!localStorage.getItem('token')) return;

    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Set new timer
    inactivityTimerRef.current = setTimeout(() => {
      handleInactivityLogout();
    }, INACTIVITY_TIMEOUT);
  }, [handleInactivityLogout]);

  // Set up activity listeners when user is logged in
  useEffect(() => {
    if (!token) {
      // Clear timer when logged out
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    // Activity events to track
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];

    // Throttle the reset function to avoid excessive calls
    let lastActivity = Date.now();
    const throttledReset = () => {
      const now = Date.now();
      // Only reset if more than 1 second has passed since last activity
      if (now - lastActivity > 1000) {
        lastActivity = now;
        resetInactivityTimer();
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, throttledReset, { passive: true });
    });

    // Start the initial timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledReset);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [token, resetInactivityTimer]);

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.getProfile()
        .then(userData => {
          setUser(userData);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone, code) => {
    const data = await api.verifyOTP(phone, code);
    setUser(data.user);
    // Token is already set in localStorage by api.verifyOTP
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }

    // Initialize push notifications for mobile platforms
    if (isMobilePlatform) {
      try {
        await PushNotificationService.initialize();
      } catch (error) {
        console.error('[Auth] Failed to initialize push notifications:', error);
      }
    }

    return data;
  };

  const register = async (phone, name, role) => {
    return await api.register(phone, name, role);
  };

  const logout = async () => {
    // Clean up push notifications for mobile platforms
    if (isMobilePlatform) {
      try {
        await PushNotificationService.cleanup();
      } catch (error) {
        console.error('[Auth] Failed to cleanup push notifications:', error);
      }
    }

    api.setToken(null);
    setUser(null);
    setToken(null);
    route('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
