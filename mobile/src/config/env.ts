import { Platform } from 'react-native';

// API 配置
const getApiBaseUrl = () => {
  // Web 生產環境使用相對路徑（通過 nginx 代理）
  if (Platform.OS === 'web' && !__DEV__) {
    return '/api/v1';
  }
  // 開發環境
  if (__DEV__) {
    return 'http://localhost:3000/api/v1';
  }
  // 原生 App 生產環境
  return 'https://api.medical-support.tw/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

// 其他配置
export const CONFIG = {
  // Token 配置
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user',

  // 分頁配置
  DEFAULT_PAGE_SIZE: 20,

  // 超時配置
  API_TIMEOUT: 10000,
};

