// 用戶類型
export type UserType = 'healthcare_professional' | 'hospital_admin' | 'system_admin';

// 醫事人員類別
export type ProfessionalType =
  | 'doctor'
  | 'nurse'
  | 'registered_nurse'
  | 'pharmacist'
  | 'pharmacy_technician'
  | 'medical_technologist'
  | 'medical_laboratory_technician';

// 職缺類型
export type JobType = 'support' | 'permanent';

// 服務類型
export type ServiceType = 'outpatient' | 'inpatient' | 'emergency' | 'other';

// 職缺狀態
export type JobStatus = 'draft' | 'open' | 'closed' | 'filled' | 'cancelled';

// 申請狀態
export type ApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'withdrawn';

// 星期
export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// 用戶
export interface User {
  userId: string;
  email: string;
  userType: UserType;
  name: string;
  phone: string;
  isVerified: boolean;
}

// 醫事人員檔案
export interface ProfessionalProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  professionalType: ProfessionalType;
  licenseNumber: string;
  specialties: string[];
  yearsOfExperience: number;
  currentHospital: string;
  availableForSupport: boolean;
  availableRegions: string[];
  availableDays: Weekday[];
  bio: string;
  profileCompletionRate: number;
  rating: number;
  totalApplications: number;
  totalCompletedJobs: number;
  createdAt: string;
  updatedAt: string;
}

// 醫院
export interface Hospital {
  hospitalId: string;
  name: string;
  county: string;
  township: string;
  address?: string;
  phone?: string;
  type?: string;
}

// 職缺
export interface Job {
  jobId: string;
  hospital: Hospital | null;
  county: string;
  township: string;
  professionalType: ProfessionalType;
  specialty: string | null;
  numberOfPositions: number;
  jobType: JobType;
  serviceType: ServiceType | null;
  serviceDays: Weekday[];
  serviceStartDate: string;
  serviceEndDate: string;
  isPublicFunded: boolean;
  mealProvided: boolean;
  accommodationProvided: boolean;
  transportationProvided: boolean;
  salary: {
    amount: number;
    currency: string;
    unit: string;
  } | null;
  contactInfo: {
    name: string;
    phone: string;
    email?: string;
  } | null;
  remarks: string | null;
  requirements: string | null;
  status: JobStatus;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

// 申請
export interface Application {
  applicationId: string;
  job: {
    jobId: string;
    county: string;
    township: string;
    professionalType: ProfessionalType;
    specialty: string | null;
    status: JobStatus;
    hospital: {
      hospitalId: string;
      name: string;
    } | null;
  } | null;
  professional: {
    userId: string;
    name: string;
    professionalType: ProfessionalType;
    specialties: string[];
    yearsOfExperience: number;
  } | null;
  coverLetter: string | null;
  availableStartDate: string | null;
  status: ApplicationStatus;
  reviewNote: string | null;
  appliedAt: string;
  reviewedAt: string | null;
}

// 分頁
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API 響應
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: Pagination;
}

// 登入響應
export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
}

// 地區
export interface Region {
  county: string;
  townships: string[];
}

// 專科
export interface Specialty {
  id: string;
  name: string;
  category: string;
}

