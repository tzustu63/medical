import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JobsStackParamList } from './types';
import JobListScreen from '@/screens/jobs/JobListScreen';
import JobDetailScreen from '@/screens/jobs/JobDetailScreen';
import ApplyJobScreen from '@/screens/jobs/ApplyJobScreen';

const Stack = createNativeStackNavigator<JobsStackParamList>();

const JobsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: '返回',
      }}
    >
      <Stack.Screen
        name="JobList"
        component={JobListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: '職缺詳情' }}
      />
      <Stack.Screen
        name="ApplyJob"
        component={ApplyJobScreen}
        options={{ title: '申請職缺' }}
      />
    </Stack.Navigator>
  );
};

export default JobsNavigator;

