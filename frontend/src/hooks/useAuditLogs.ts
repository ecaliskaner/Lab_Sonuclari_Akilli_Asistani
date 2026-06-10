import { useQuery } from '@tanstack/react-query';
import { auditLogApi } from '../api/auditLogApi';
import type { AuditFilterParams } from '../api/auditLogApi';

export function useAuditLogs(params: AuditFilterParams, enabled: boolean) {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => auditLogApi.getAuditLogs(params),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    enabled,
  });
}
