import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, pass: string, role?: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: 'student' | 'admin') => Promise<void>;
  refreshUser: () => Promise<void>;
  setCoins: (newCoins: number) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('studygen_token') || 'usr_student_01');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('studygen_token', token);
      refreshUser().finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string, rememberMe?: boolean) => {
    const res = await api.login({ email, password: pass, rememberMe });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('studygen_token', res.token);
    showToast(`Welcome back, ${res.user.name}!`, 'success');
  };

  const register = async (name: string, email: string, pass: string, role = 'student') => {
    const res = await api.register({ name, email, password: pass, role });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('studygen_token', res.token);
    showToast(`Registration complete! 200 Welcome Coins added.`, 'success');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('studygen_token');
    showToast('Signed out successfully', 'info');
  };

  const switchDemoRole = async (role: 'student' | 'admin') => {
    const demoToken = role === 'admin' ? 'usr_admin_01' : 'usr_student_01';
    setToken(demoToken);
    localStorage.setItem('studygen_token', demoToken);
    try {
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
        showToast(`Switched active profile to ${data.user.name} (${role})`, 'info');
      }
    } catch (e) {
      showToast(`Switched to demo ${role}`, 'info');
    }
  };

  const setCoins = (newCoins: number) => {
    if (user) {
      setUser({ ...user, coins: newCoins });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUser,
        setCoins,
        toast,
        showToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
