import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import apiClient from './client';
import { CONFIG } from '@/config/env';
import type { User, LoginResponse, ProfessionalType, UserType } from '@/types';

// 跨平台儲存工具
const storage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

export interface RegisterParams {
  email: string;
  password: string;
  userType: UserType;
  name: string;
  phone: string;
  idNumber?: string;
  professionalType?: ProfessionalType;
  licenseNumber?: string;
  hospitalCode?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export const authService = {
  // 註冊
  register: async (params: RegisterParams) => {
    const response = await apiClient.post('/auth/register', params);
    return response.data;
  },

  // 登入
  login: async (params: LoginParams): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', params);
    const { token, refreshToken, user } = response.data;

    // 儲存 tokens 和用戶資訊
    await storage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
    await storage.setItem(CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    await storage.setItem(CONFIG.USER_KEY, JSON.stringify(user));

    return response.data;
  },

  // 登出
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // 不管 API 是否成功，都清除本地 tokens
      await storage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
      await storage.removeItem(CONFIG.REFRESH_TOKEN_KEY);
      await storage.removeItem(CONFIG.USER_KEY);
    }
  },

  // 刷新 token
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // 取得當前用戶
  getCurrentUser: async (): Promise<User | null> => {
    const userJson = await storage.getItem(CONFIG.USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  },

  // 檢查是否已登入
  isAuthenticated: async (): Promise<boolean> => {
    const token = await storage.getItem(CONFIG.ACCESS_TOKEN_KEY);
    return !!token;
  },
};

