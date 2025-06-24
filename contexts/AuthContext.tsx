import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/api';
import { apiService } from '../services/api';
import { socketService } from '../services/socket';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: any,
    isShopOwner?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        setUser(JSON.parse(userData));
        await socketService.connect();
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });

      if (response.success && response.data) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        await socketService.connect();
        return { success: true };
      }

      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (userData: any, isShopOwner = false) => {
    try {
      const response = isShopOwner
        ? await apiService.registerShopOwner(userData)
        : await apiService.registerUser(userData);

      if (response.success && response.data) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        await socketService.connect();
        return { success: true };
      }

      return { success: false, error: response.error || 'Registration failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    await apiService.logout();
    socketService.disconnect();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
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
