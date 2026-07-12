'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Host' | 'Tourist';
  isVerified: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAuthData = async () => {
    try {
      const storedToken = localStorage.getItem('lankastay_token');
      const storedUser = localStorage.getItem('lankastay_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Sync profile state with API to get live verification flags
        try {
          const profile = await apiClient.get<UserProfile>('/auth/me');
          setUser(profile);
          localStorage.setItem('lankastay_user', JSON.stringify(profile));
        } catch (e) {
          console.error('Failed to sync profile', e);
        }
      }
    } catch (error) {
      console.error('Error loading auth data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthData();

    // Listen for custom API client events (like auto-logout on 401)
    const handleAuthChange = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth_change', handleAuthChange);
    return () => window.removeEventListener('auth_change', handleAuthChange);
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const response = await apiClient.post<any>('/auth/login', credentials);
      const userProfile: UserProfile = {
        id: response.id,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
        isVerified: response.isVerified,
      };

      localStorage.setItem('lankastay_token', response.token);
      localStorage.setItem('lankastay_user', JSON.stringify(userProfile));
      setToken(response.token);
      setUser(userProfile);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: any) => {
    setLoading(true);
    try {
      const response = await apiClient.post<any>('/auth/register', payload);
      const userProfile: UserProfile = {
        id: response.id,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
        isVerified: response.isVerified,
      };

      localStorage.setItem('lankastay_token', response.token);
      localStorage.setItem('lankastay_user', JSON.stringify(userProfile));
      setToken(response.token);
      setUser(userProfile);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lankastay_token');
    localStorage.removeItem('lankastay_user');
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const profile = await apiClient.get<UserProfile>('/auth/me');
      setUser(profile);
      localStorage.setItem('lankastay_user', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to refresh user profile', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
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
