import apiClient from './client';
import type { Application, ApiResponse, Pagination, ApplicationStatus } from '@/types';

export interface CreateApplicationParams {
  jobId: string;
  coverLetter?: string;
  availableStartDate?: string;
}

export interface QueryApplicationsParams {
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
}

export interface ApplicationsListResponse {
  success: boolean;
  data: Application[];
  pagination: Pagination;
}

export interface ReviewApplicationParams {
  status: 'approved' | 'rejected';
  reviewNote?: string;
}

export const applicationsService = {
  // 取得申請列表
  getApplications: async (params?: QueryApplicationsParams): Promise<ApplicationsListResponse> => {
    const response = await apiClient.get<ApplicationsListResponse>('/applications', { params });
    return response.data;
  },

  // 取得申請詳情
  getApplication: async (applicationId: string): Promise<Application> => {
    const response = await apiClient.get<Application>(`/applications/${applicationId}`);
    return response.data;
  },

  // 申請職缺
  createApplication: async (params: CreateApplicationParams): Promise<ApiResponse<Application>> => {
    const response = await apiClient.post<ApiResponse<Application>>('/applications', params);
    return response.data;
  },

  // 取消申請
  cancelApplication: async (applicationId: string): Promise<void> => {
    await apiClient.delete(`/applications/${applicationId}`);
  },

  // 審核申請（醫院管理員）
  reviewApplication: async (
    applicationId: string,
    params: ReviewApplicationParams
  ): Promise<ApiResponse<Application>> => {
    const response = await apiClient.post<ApiResponse<Application>>(
      `/applications/${applicationId}/review`,
      params
    );
    return response.data;
  },
};

