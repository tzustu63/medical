import apiClient from './client';
import type { Region, Specialty, Hospital } from '@/types';

interface RegionsResponse {
  success: boolean;
  data: Region[];
}

interface SpecialtiesResponse {
  success: boolean;
  data: Specialty[];
}

interface HospitalsResponse {
  success: boolean;
  data: Hospital[];
}

export const systemService = {
  // 取得縣市鄉鎮列表
  getRegions: async (): Promise<Region[]> => {
    const response = await apiClient.get<RegionsResponse>('/system/regions');
    return response.data.data;
  },

  // 取得專科列表
  getSpecialties: async (professionalType?: string): Promise<Specialty[]> => {
    const response = await apiClient.get<SpecialtiesResponse>('/system/specialties', {
      params: { professionalType },
    });
    return response.data.data;
  },

  // 取得醫院列表
  getHospitals: async (
    county?: string,
    township?: string,
    search?: string
  ): Promise<Hospital[]> => {
    const response = await apiClient.get<HospitalsResponse>('/system/hospitals', {
      params: { county, township, search },
    });
    return response.data.data;
  },
};

