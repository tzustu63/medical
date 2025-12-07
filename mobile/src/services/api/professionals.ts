import apiClient from './client';
import type { ProfessionalProfile, Weekday } from '@/types';

export interface UpdateProfileParams {
  name?: string;
  phone?: string;
  specialties?: string[];
  yearsOfExperience?: number;
  currentHospital?: string;
  availableForSupport?: boolean;
  availableRegions?: string[];
  availableDays?: Weekday[];
  bio?: string;
}

export interface SetAvailabilityParams {
  availableDays?: Weekday[];
  availableRegions?: string[];
  startDate?: string;
  endDate?: string;
}

export const professionalsService = {
  // 取得個人檔案
  getProfile: async (): Promise<ProfessionalProfile> => {
    const response = await apiClient.get<ProfessionalProfile>('/professionals/profile');
    return response.data;
  },

  // 更新個人檔案
  updateProfile: async (params: UpdateProfileParams): Promise<ProfessionalProfile> => {
    const response = await apiClient.put<ProfessionalProfile>('/professionals/profile', params);
    return response.data;
  },

  // 設定支援意願
  setAvailability: async (params: SetAvailabilityParams): Promise<void> => {
    await apiClient.post('/professionals/availability', params);
  },
};

