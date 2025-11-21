import { apiClient } from './client';
import { Exhibition, ApiResponse, PaginatedResponse } from '@/lib/types/api.types';

export const exhibitionsApi = {
  list: (page = 1, pageSize = 10) =>
    apiClient.get<PaginatedResponse<Exhibition>>(
      `/exhibitions?page=${page}&pageSize=${pageSize}`
    ),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Exhibition>>(`/exhibitions/${id}`),

  create: (data: Partial<Exhibition>) =>
    apiClient.post<ApiResponse<Exhibition>>('/exhibitions', data),

  update: (id: string, data: Partial<Exhibition>) =>
    apiClient.put<ApiResponse<Exhibition>>(`/exhibitions/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/exhibitions/${id}`),

  publish: (id: string) =>
    apiClient.post<ApiResponse<Exhibition>>(`/exhibitions/${id}/publish`),

  duplicate: (id: string) =>
    apiClient.post<ApiResponse<Exhibition>>(`/exhibitions/${id}/duplicate`),
};
