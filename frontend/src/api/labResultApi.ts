import { axiosInstance } from './axiosInstance';
import type { LabResult, LabResultSummary, PaginatedResponse, LabResultStats } from '../types/labResult';

export interface FilterParams {
  page?: number;
  size?: number;
  severity?: string;
  testCode?: string;
  patientRef?: string;
  from?: string;
  to?: string;
}

export const labResultApi = {
  getResults: async (params: FilterParams): Promise<PaginatedResponse<LabResultSummary>> => {
    const cleanParams: Record<string, string | number | undefined> = { ...params };
    
    // Clean up empty parameters before sending
    Object.keys(cleanParams).forEach((key) => {
      if (cleanParams[key] === undefined || cleanParams[key] === null || cleanParams[key] === '') {
        delete cleanParams[key];
      }
    });

    // Format dates to ISO strings if present
    if (cleanParams.from) {
      cleanParams.from = new Date(cleanParams.from).toISOString();
    }
    if (cleanParams.to) {
      cleanParams.to = new Date(cleanParams.to).toISOString();
    }

    const response = await axiosInstance.get<PaginatedResponse<LabResultSummary>>('/api/lab-results', {
      params: cleanParams,
    });
    return response.data;
  },

  getStats: async (params: Omit<FilterParams, 'page' | 'size'>): Promise<LabResultStats> => {
    const cleanParams: Record<string, string | number | undefined> = { ...params };
    
    Object.keys(cleanParams).forEach((key) => {
      if (cleanParams[key] === undefined || cleanParams[key] === null || cleanParams[key] === '') {
        delete cleanParams[key];
      }
    });

    if (cleanParams.from) {
      cleanParams.from = new Date(cleanParams.from).toISOString();
    }
    if (cleanParams.to) {
      cleanParams.to = new Date(cleanParams.to).toISOString();
    }

    const response = await axiosInstance.get<LabResultStats>('/api/lab-results/stats', {
      params: cleanParams,
    });
    return response.data;
  },

  getResultById: async (id: number | string): Promise<LabResult> => {
    const response = await axiosInstance.get<LabResult>(`/api/lab-results/${id}`);
    return response.data;
  },

  getTestCodes: async (): Promise<string[]> => {
    const response = await axiosInstance.get<string[]>('/api/lab-results/test-codes');
    return response.data;
  },
};
