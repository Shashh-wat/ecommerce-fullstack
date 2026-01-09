import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAuth: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = () => {
    const currentUser = authAPI.getCurrentUser();
    const token = localStorage.getItem('authToken');
    
    // Only set user if we have both user data and a valid token
    if (currentUser && token) {
      setUser(currentUser);
    } else {
      setUser(null);
      // Clean up invalid auth state
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  };

  const signOut = async () => {
    await authAPI.signout();
    setUser(null);
  };

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authAPI.getCurrentUser();
    const token = localStorage.getItem('authToken');
    
    // Only set user if we have both user data and a valid token
    if (currentUser && token) {
      setUser(currentUser);
    } else {
      setUser(null);
      // Clean up invalid auth state
      if (!token && currentUser) {
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        refreshAuth,
        signOut,
      }}
    >
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