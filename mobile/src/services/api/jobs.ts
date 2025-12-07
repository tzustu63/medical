import apiClient from './client';
import type { Job, ApiResponse, Pagination, ProfessionalType, ServiceType } from '@/types';

export interface SearchJobsParams {
  county?: string;
  township?: string;
  hospitalName?: string;
  professionalType?: ProfessionalType;
  specialty?: string;
  serviceType?: ServiceType;
  weekday?: string;
  publicFundedOnly?: boolean;
  startDate?: string;
  page?: number;
  limit?: number;
}

export interface JobsListResponse {
  success: boolean;
  data: Job[];
  pagination: Pagination;
}

export const jobsService = {
  // 搜尋職缺
  searchJobs: async (params?: SearchJobsParams): Promise<JobsListResponse> => {
    const response = await apiClient.get<JobsListResponse>('/jobs', { params });
    return response.data;
  },

  // 取得職缺詳情
  getJob: async (jobId: string): Promise<Job> => {
    const response = await apiClient.get<Job>(`/jobs/${jobId}`);
    return response.data;
  },

  // 建立職缺（醫院管理員）
  createJob: async (jobData: Partial<Job>): Promise<ApiResponse<Job>> => {
    const response = await apiClient.post<ApiResponse<Job>>('/jobs', jobData);
    return response.data;
  },

  // 更新職缺
  updateJob: async (jobId: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> => {
    const response = await apiClient.put<ApiResponse<Job>>(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  // 刪除職缺
  deleteJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/jobs/${jobId}`);
  },

  // 關閉職缺
  closeJob: async (jobId: string): Promise<void> => {
    await apiClient.post(`/jobs/${jobId}/close`);
  },
};

