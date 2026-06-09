'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/services/auth';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  googleLogin: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCurrentUser() {
      const accessToken = Cookies.get('access_token');
      const refreshToken = Cookies.get('refresh_token');

      if (accessToken || refreshToken) {
        try {
          const response = await api.get('/auth/me/');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to load current user', error);
          // Cookies are automatically cleaned if refresh also fails via the Axios response interceptor
        }
      }
      setLoading(false);
    }
    loadCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login/', { email, password });
      const { access, refresh, user: userData } = response.data;
      
      // Save tokens in cookies
      Cookies.set('access_token', access, { expires: 1 / 24, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      Cookies.set('refresh_token', refresh, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      
      setUser(userData);
      router.push('/dashboard');
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, name: string, password: string) => {
    setLoading(true);
    try {
      // Split name into first and last names
      const nameParts = name.trim().split(/\s+/);
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      const response = await api.post('/auth/register/', {
        email,
        password,
        confirm_password: password,
        first_name,
        last_name,
      });

      const { access, refresh, user: userData } = response.data;

      // Save tokens in cookies
      Cookies.set('access_token', access, { expires: 1 / 24, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      Cookies.set('refresh_token', refresh, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

      setUser(userData);
      router.push('/dashboard');
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (accessToken: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google/', {
        access_token: accessToken,
      });

      const { access, refresh, user: userData } = response.data;

      // Save tokens in cookies
      Cookies.set('access_token', access, { expires: 1 / 24, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      Cookies.set('refresh_token', refresh, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

      setUser(userData);
      router.push('/dashboard');
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      // Clear cookies and user data
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      setUser(null);
      router.push('/login');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
