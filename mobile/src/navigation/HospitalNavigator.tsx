import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  HospitalHomeScreen,
  HospitalJobsScreen,
  CreateJobScreen,
  HospitalApplicationsScreen,
  HospitalProfileScreen,
} from '@/screens/hospital';

// 類型定義
export type HospitalTabParamList = {
  HospitalHome: undefined;
  HospitalJobs: undefined;
  HospitalApplications: undefined;
  HospitalProfile: undefined;
};

export type HospitalJobsStackParamList = {
  JobsList: undefined;
  CreateJob: undefined;
  EditJob: { jobId: string };
  JobApplications: { jobId: string };
};

const Tab = createBottomTabNavigator<HospitalTabParamList>();
const JobsStack = createNativeStackNavigator<HospitalJobsStackParamList>();

// 職缺管理 Stack Navigator
const HospitalJobsStackNavigator = () => {
  const theme = useTheme();

  return (
    <JobsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
      }}
    >
      <JobsStack.Screen
        name="JobsList"
        component={HospitalJobsScreen}
        options={{ title: '職缺管理' }}
      />
      <JobsStack.Screen
        name="CreateJob"
        component={CreateJobScreen}
        options={{ title: '發布職缺' }}
      />
      <JobsStack.Screen
        name="EditJob"
        component={CreateJobScreen}
        options={{ title: '編輯職缺' }}
      />
    </JobsStack.Navigator>
  );
};

const HospitalNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.surfaceVariant,
          backgroundColor: theme.colors.surface,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Tab.Screen
        name="HospitalHome"
        component={HospitalHomeScreen}
        options={{
          title: '首頁',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HospitalJobs"
        component={HospitalJobsStackNavigator}
        options={{
          title: '職缺管理',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HospitalApplications"
        component={HospitalApplicationsScreen}
        options={{
          title: '申請審核',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-check" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HospitalProfile"
        component={HospitalProfileScreen}
        options={{
          title: '設定',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HospitalNavigator;

