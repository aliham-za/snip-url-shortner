import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../lib/api';
import { setForceLogoutHandler } from '../lib/api';

const AuthContext = createContext(null);

function getSavedUser() {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser);

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token && !!user;

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email: email.trim(), password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (email, password, password_confirmation) => {
    const { data } = await authAPI.signup({ email: email.trim(), password, password_confirmation });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    authAPI.logout().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    setForceLogoutHandler(() => setUser(null));
    return () => setForceLogoutHandler(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
