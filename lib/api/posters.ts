import { apiClient } from './client';
import { ApiResponse } from '@/lib/types/api.types';

export const postersApi = {
  generate: (exhibitionId: string) =>
    apiClient.post<ApiResponse<{ posterUrl: string }>>(
      `/posters/generate`,
      { exhibitionId }
    ),

  regenerate: (exhibitionId: string) =>
    apiClient.post<ApiResponse<{ posterUrl: string }>>(
      `/posters/regenerate`,
      { exhibitionId }
    ),
};
