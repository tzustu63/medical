# 前端技術規範 - React Native APP

## 1. 技術堆疊

### 核心框架
- **React Native**: 0.72+
- **Expo**: SDK 49+
- **TypeScript**: 5.0+

### UI 組件庫
- **React Native Paper**: Material Design組件庫
- **React Native Elements**: 補充組件
- **React Native Vector Icons**: 圖標庫

### 狀態管理
- **Redux Toolkit**: 狀態管理
- **Redux Persist**: 狀態持久化
- **RTK Query**: API資料快取

### 路由導航
- **React Navigation 6**: 主要導航庫
  - Stack Navigator
  - Tab Navigator
  - Drawer Navigator

### 表單處理
- **React Hook Form**: 表單處理
- **Yup**: 表單驗證

### HTTP 客戶端
- **Axios**: HTTP請求
- **Axios Retry**: 請求重試

### 其他核心庫
- **date-fns**: 日期處理
- **i18next**: 國際化（未來）
- **react-native-push-notification**: 推播通知
- **react-native-async-storage**: 本地儲存

## 2. 專案結構

```
mobile/
├── src/
│   ├── screens/                    # 畫面組件
│   │   ├── auth/                   # 認證相關畫面
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── professional/           # 醫事人員畫面
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileScreen.tsx
│   │   │   └── AvailabilityScreen.tsx
│   │   ├── jobs/                   # 職缺相關畫面
│   │   │   ├── JobListScreen.tsx
│   │   │   ├── JobDetailScreen.tsx
│   │   │   ├── JobSearchScreen.tsx
│   │   │   └── CreateJobScreen.tsx
│   │   ├── applications/           # 申請相關畫面
│   │   │   ├── ApplicationListScreen.tsx
│   │   │   ├── ApplicationDetailScreen.tsx
│   │   │   └── ApplyJobScreen.tsx
│   │   └── common/                 # 共用畫面
│   │       ├── HomeScreen.tsx
│   │       ├── NotificationScreen.tsx
│   │       └── SettingsScreen.tsx
│   │
│   ├── components/                 # 可複用組件
│   │   ├── common/                 # 通用組件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── job/                    # 職缺組件
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobFilter.tsx
│   │   │   └── JobMap.tsx
│   │   └── professional/           # 醫事人員組件
│   │       ├── ProfileCard.tsx
│   │       └── SkillSelector.tsx
│   │
│   ├── navigation/                 # 導航配置
│   │   ├── AppNavigator.tsx        # 主導航
│   │   ├── AuthNavigator.tsx       # 認證流程導航
│   │   ├── ProfessionalNavigator.tsx
│   │   ├── HospitalNavigator.tsx
│   │   └── types.ts                # 導航類型定義
│   │
│   ├── store/                      # Redux Store
│   │   ├── index.ts                # Store配置
│   │   ├── slices/                 # Redux Slices
│   │   │   ├── authSlice.ts
│   │   │   ├── userSlice.ts
│   │   │   ├── jobSlice.ts
│   │   │   └── applicationSlice.ts
│   │   └── api/                    # RTK Query API
│   │       ├── authApi.ts
│   │       ├── jobApi.ts
│   │       └── applicationApi.ts
│   │
│   ├── services/                   # 服務層
│   │   ├── api/                    # API服務
│   │   │   ├── client.ts           # Axios客戶端配置
│   │   │   ├── auth.ts
│   │   │   ├── job.ts
│   │   │   └── application.ts
│   │   ├── storage/                # 本地儲存
│   │   │   └── asyncStorage.ts
│   │   ├── notification/           # 推播通知
│   │   │   └── pushNotification.ts
│   │   └── location/               # 定位服務
│   │       └── geolocation.ts
│   │
│   ├── hooks/                      # 自定義Hooks
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useKeyboard.ts
│   │   └── usePushNotification.ts
│   │
│   ├── utils/                      # 工具函數
│   │   ├── validation.ts           # 驗證函數
│   │   ├── formatter.ts            # 格式化函數
│   │   ├── constants.ts            # 常數定義
│   │   └── helpers.ts              # 輔助函數
│   │
│   ├── types/                      # TypeScript類型定義
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── job.ts
│   │   ├── application.ts
│   │   └── api.ts
│   │
│   ├── theme/                      # 主題配置
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   ├── config/                     # 配置檔案
│   │   ├── env.ts                  # 環境變數
│   │   └── app.ts                  # APP配置
│   │
│   └── App.tsx                     # 主應用組件
│
├── assets/                         # 靜態資源
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── app.json                        # Expo配置
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── .env.example
```

## 3. 編碼規範

### 3.1 TypeScript規範

```typescript
// ✅ 好的寫法
interface User {
  id: string;
  name: string;
  email: string;
  userType: 'healthcare_professional' | 'hospital_admin';
}

const fetchUser = async (userId: string): Promise<User> => {
  const response = await api.get<User>(`/users/${userId}`);
  return response.data;
};

// ❌ 避免使用 any
const badFunction = (data: any) => {
  return data.something;
};

// ✅ 使用泛型
const goodFunction = <T>(data: T): T => {
  return data;
};
```

### 3.2 React組件規範

```typescript
// ✅ 功能組件 + TypeScript
import React, { FC, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface JobCardProps {
  job: Job;
  onPress: (jobId: string) => void;
}

export const JobCard: FC<JobCardProps> = ({ job, onPress }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = () => {
    onPress(job.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{job.title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### 3.3 命名規範

```typescript
// 組件: PascalCase
const JobCard = () => {};
const LoginScreen = () => {};

// 變數和函數: camelCase
const userName = 'John';
const fetchUserData = () => {};

// 常數: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;

// 類型和接口: PascalCase
interface UserProfile {}
type JobStatus = 'open' | 'closed';

// 私有函數: _camelCase (選用)
const _helperFunction = () => {};
```

### 3.4 檔案命名規範

```
- 組件: PascalCase.tsx (例: JobCard.tsx)
- Hooks: camelCase.ts (例: useAuth.ts)
- 工具函數: camelCase.ts (例: validation.ts)
- 類型: camelCase.ts (例: user.ts)
- 常數: camelCase.ts (例: constants.ts)
```

## 4. 狀態管理架構

### 4.1 Redux Toolkit設置

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import { jobApi } from './api/jobApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [jobApi.reducerPath]: jobApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(jobApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 4.2 RTK Query API定義

```typescript
// store/api/jobApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Job, JobSearchParams } from '@/types/job';

export const jobApi = createApi({
  reducerPath: 'jobApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Job'],
  endpoints: (builder) => ({
    getJobs: builder.query<Job[], JobSearchParams>({
      query: (params) => ({
        url: '/jobs',
        params,
      }),
      providesTags: ['Job'],
    }),
    getJobById: builder.query<Job, string>({
      query: (id) => `/jobs/${id}`,
    }),
    createJob: builder.mutation<Job, Partial<Job>>({
      query: (job) => ({
        url: '/jobs',
        method: 'POST',
        body: job,
      }),
      invalidatesTags: ['Job'],
    }),
  }),
});

export const { 
  useGetJobsQuery, 
  useGetJobByIdQuery, 
  useCreateJobMutation 
} = jobApi;
```

### 4.3 Redux Slice範例

```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state, 
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
```

## 5. 導航架構

### 5.1 導航類型定義

```typescript
// navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: { userType: 'professional' | 'hospital' };
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Jobs: undefined;
  Applications: undefined;
  Profile: undefined;
};

export type JobStackParamList = {
  JobList: undefined;
  JobDetail: { jobId: string };
  JobSearch: undefined;
};
```

### 5.2 導航器實現

```typescript
// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '@/hooks/redux';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
```

## 6. API服務層

### 6.1 Axios客戶端配置

```typescript
// services/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/config/env';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Token過期，嘗試刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const { token } = response.data;
        await AsyncStorage.setItem('access_token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 刷新失敗，登出用戶
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // 導航到登入頁面
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 6.2 API服務範例

```typescript
// services/api/job.ts
import apiClient from './client';
import { Job, JobSearchParams, CreateJobDto } from '@/types/job';

export const jobService = {
  // 搜尋職缺
  searchJobs: async (params: JobSearchParams) => {
    const response = await apiClient.get<{ data: Job[] }>('/jobs', { params });
    return response.data.data;
  },

  // 取得職缺詳情
  getJobById: async (jobId: string) => {
    const response = await apiClient.get<Job>(`/jobs/${jobId}`);
    return response.data;
  },

  // 建立職缺
  createJob: async (job: CreateJobDto) => {
    const response = await apiClient.post<Job>('/jobs', job);
    return response.data;
  },

  // 更新職缺
  updateJob: async (jobId: string, job: Partial<CreateJobDto>) => {
    const response = await apiClient.put<Job>(`/jobs/${jobId}`, job);
    return response.data;
  },

  // 刪除職缺
  deleteJob: async (jobId: string) => {
    await apiClient.delete(`/jobs/${jobId}`);
  },
};
```

## 7. 表單處理

### 7.1 React Hook Form + Yup

```typescript
// screens/auth/LoginScreen.tsx
import React from 'react';
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TextInput, Button } from 'react-native-paper';

interface LoginFormData {
  email: string;
  password: string;
}

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('請輸入有效的電子郵件')
    .required('電子郵件為必填'),
  password: yup
    .string()
    .min(8, '密碼至少需要8個字元')
    .required('密碼為必填'),
});

const LoginScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // 呼叫登入API
      await authService.login(data);
    } catch (error) {
      console.error('登入失敗:', error);
    }
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="電子郵件"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && <Text>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="密碼"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.password}
            secureTextEntry
          />
        )}
      />
      {errors.password && <Text>{errors.password.message}</Text>}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        登入
      </Button>
    </View>
  );
};
```

## 8. 主題系統

### 8.1 主題配置

```typescript
// theme/index.ts
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#FF9800',
    tertiary: '#4CAF50',
    error: '#F44336',
    background: '#F5F5F5',
    surface: '#FFFFFF',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#64B5F6',
    secondary: '#FFB74D',
    tertiary: '#81C784',
    error: '#EF5350',
    background: '#121212',
    surface: '#1E1E1E',
  },
};

// 共用間距
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 共用字體大小
export const typography = {
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  body: 16,
  caption: 14,
  small: 12,
};
```

## 9. 測試規範

### 9.1 組件測試

```typescript
// __tests__/components/JobCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { JobCard } from '@/components/job/JobCard';

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    title: '內科醫師',
    hospital: '測試醫院',
    county: '屏東縣',
    township: '來義鄉',
  };

  const mockOnPress = jest.fn();

  it('應該正確渲染職缺資訊', () => {
    const { getByText } = render(
      <JobCard job={mockJob} onPress={mockOnPress} />
    );

    expect(getByText('內科醫師')).toBeTruthy();
    expect(getByText('測試醫院')).toBeTruthy();
  });

  it('點擊時應該呼叫 onPress', () => {
    const { getByTestId } = render(
      <JobCard job={mockJob} onPress={mockOnPress} />
    );

    fireEvent.press(getByTestId('job-card'));
    expect(mockOnPress).toHaveBeenCalledWith('1');
  });
});
```

## 10. 效能優化

### 10.1 列表優化

```typescript
// 使用 FlashList 替代 FlatList
import { FlashList } from '@shopify/flash-list';

const JobList = ({ jobs }) => {
  const renderItem = useCallback(({ item }) => (
    <JobCard job={item} onPress={handleJobPress} />
  ), []);

  return (
    <FlashList
      data={jobs}
      renderItem={renderItem}
      estimatedItemSize={100}
      keyExtractor={(item) => item.id}
    />
  );
};
```

### 10.2 圖片優化

```typescript
// 使用 React Native Fast Image
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

## 11. 建置與發布

### 11.1 環境配置

```typescript
// config/env.ts
import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'http://localhost:3000/api',
  },
  staging: {
    apiUrl: 'https://staging-api.example.com/api',
  },
  prod: {
    apiUrl: 'https://api.example.com/api',
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  } else if (Constants.manifest?.releaseChannel === 'staging') {
    return ENV.staging;
  } else {
    return ENV.prod;
  }
};

export default getEnvVars();
```

### 11.2 建置指令

```bash
# 開發模式
npx expo start

# Android建置
eas build --platform android --profile production

# iOS建置
eas build --platform ios --profile production

# 更新OTA
eas update --branch production
```

## 12. 最佳實踐總結

### ✅ 必須遵守
1. 所有組件使用TypeScript
2. 使用函數組件和Hooks
3. 遵循命名規範
4. 添加適當的錯誤處理
5. 編寫單元測試（覆蓋率>70%）

### 📝 建議遵守
1. 使用React.memo優化渲染
2. 使用useCallback和useMemo
3. 避免內聯樣式
4. 使用主題系統統一樣式
5. 添加適當的註解

### ⚠️ 避免事項
1. 避免使用any類型
2. 避免深層嵌套
3. 避免過大的組件
4. 避免在render中創建函數
5. 避免不必要的重新渲染
