import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// 自定義顏色
const customColors = {
  primary: '#1976D2', // 醫療藍
  secondary: '#43A047', // 健康綠
  tertiary: '#FF7043', // 偏鄉橙
  error: '#D32F2F',
  warning: '#FFA000',
  success: '#388E3C',
  info: '#1976D2',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceVariant: '#E3F2FD',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
  },
  roundness: 8,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#64B5F6',
    secondary: '#81C784',
    tertiary: '#FF8A65',
    error: '#EF5350',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#263238',
    onPrimary: '#000000',
    onSecondary: '#000000',
  },
  roundness: 8,
};

// 共用樣式
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  body: 16,
  caption: 14,
  small: 12,
};

