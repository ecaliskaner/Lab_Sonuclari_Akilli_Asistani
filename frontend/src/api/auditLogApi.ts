import { axiosInstance } from './axiosInstance';
import type { AuditLog } from '../types/auditLog';
import type { PaginatedResponse } from '../types/labResult';

export interface AuditFilterParams {
  page?: number;
  size?: number;
  action?: string;
  userId?: number;
  from?: string;
  to?: string;
}

export const auditLogApi = {
  getAuditLogs: async (params: AuditFilterParams): Promise<PaginatedResponse<AuditLog>> => {
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

    const response = await axiosInstance.get<PaginatedResponse<AuditLog>>('/api/audit-logs', {
      params: cleanParams,
    });
    return response.data;
  },
};
