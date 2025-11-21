import { apiClient } from './client';
import { ApiResponse } from '@/lib/types/api.types';

export const pdfApi = {
  generate: (exhibitionId: string) =>
    apiClient.post<ApiResponse<{ pdfUrl: string }>>(
      `/pdf/generate`,
      { exhibitionId }
    ),

  download: (exhibitionId: string) =>
    apiClient.get<Blob>(`/pdf/download/${exhibitionId}`, {
      headers: { 'Content-Type': 'application/pdf' },
    }),
};
