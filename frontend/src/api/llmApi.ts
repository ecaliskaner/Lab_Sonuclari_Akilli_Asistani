import { axiosInstance } from './axiosInstance';
import type { LlmAnalysis } from '../types/labResult';

export const llmApi = {
  analyzeResult: async (id: number | string): Promise<LlmAnalysis> => {
    const response = await axiosInstance.post<LlmAnalysis>(`/api/lab-results/${id}/analyze`);
    return response.data;
  },
};
