import { createContext } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import api from './api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return data;
  };

  const register = async (phone, name, role) => {
    return await api.register(phone, name, role);
  };

  const logout = () => {
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
