import { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList> | NavigatorScreenParams<HospitalTabParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: { userType?: 'healthcare_professional' | 'hospital_admin' };
  ForgotPassword: undefined;
};

// =====================================
// Healthcare Professional Navigation
// =====================================

// Main Tab (for Healthcare Professionals)
export type MainTabParamList = {
  Home: undefined;
  Jobs: NavigatorScreenParams<JobsStackParamList>;
  Applications: undefined;
  Profile: undefined;
};

// Jobs Stack
export type JobsStackParamList = {
  JobList: undefined;
  JobDetail: { jobId: string };
  JobSearch: undefined;
  ApplyJob: { jobId: string };
};

// =====================================
// Hospital Admin Navigation
// =====================================

// Hospital Tab
export type HospitalTabParamList = {
  HospitalHome: undefined;
  HospitalJobs: NavigatorScreenParams<HospitalJobsStackParamList>;
  HospitalApplications: undefined;
  HospitalProfile: undefined;
};

// Hospital Jobs Stack
export type HospitalJobsStackParamList = {
  JobsList: undefined;
  CreateJob: undefined;
  EditJob: { jobId: string };
  JobApplications: { jobId: string };
};

// 宣告全域導航類型
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

