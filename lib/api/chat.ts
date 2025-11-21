import { apiClient } from './client';
import { ChatSession, ApiResponse } from '@/lib/types/api.types';

export const chatApi = {
  createSession: (exhibitionId: string) =>
    apiClient.post<ApiResponse<ChatSession>>('/chat/sessions', {
      exhibitionId,
    }),

  sendMessage: (sessionId: string, message: string) =>
    apiClient.post<ApiResponse<any>>(`/chat/sessions/${sessionId}/messages`, {
      message,
    }),

  getSession: (sessionId: string) =>
    apiClient.get<ApiResponse<ChatSession>>(`/chat/sessions/${sessionId}`),
};
