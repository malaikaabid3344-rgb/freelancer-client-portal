import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fp_token');
    const cachedUser = localStorage.getItem('fp_user');
    if (token && cachedUser) {
      setUser(JSON.parse(cachedUser));
      authService
        .getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('fp_token');
          localStorage.removeItem('fp_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    localStorage.setItem('fp_token', res.data.token);
    localStorage.setItem('fp_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authService.register(name, email, password);
    localStorage.setItem('fp_token', res.data.token);
    localStorage.setItem('fp_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user');
    setUser(null);
  };

  const updateUser = (updated: User) => {
    localStorage.setItem('fp_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
