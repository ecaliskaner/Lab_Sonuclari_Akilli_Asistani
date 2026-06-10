import { useQuery } from '@tanstack/react-query';
import { labResultApi } from '../api/labResultApi';
import type { FilterParams } from '../api/labResultApi';

export function useLabResults(params: FilterParams) {
  return useQuery({
    queryKey: ['labResults', params],
    queryFn: () => labResultApi.getResults(params),
    refetchInterval: 30000, // Automatically poll every 30s
    refetchOnWindowFocus: false, // Spec: klinik ortamda beklenmedik refetch istenmiyor
    staleTime: 30000,
    retry: 2,
  });
}

export function useLabResultsStats(params: Omit<FilterParams, 'page' | 'size'>) {
  return useQuery({
    queryKey: ['labResultsStats', params],
    queryFn: () => labResultApi.getStats(params),
    refetchInterval: 30000, // Sync polling
    refetchOnWindowFocus: false,
    staleTime: 30000,
    retry: 2,
  });
}

export function useLabResultDetail(id: number | string) {
  return useQuery({
    queryKey: ['labResult', id],
    queryFn: () => labResultApi.getResultById(id),
    refetchOnWindowFocus: false,
    staleTime: 60000,
    retry: 1,
    enabled: !!id,
  });
}

export function useTestCodes() {
  return useQuery({
    queryKey: ['testCodes'],
    queryFn: labResultApi.getTestCodes,
    staleTime: 300000, // 5 minutes cache for unique test codes
    refetchOnWindowFocus: false,
  });
}
