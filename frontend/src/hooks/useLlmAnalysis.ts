import { useMutation } from '@tanstack/react-query';
import { llmApi } from '../api/llmApi';
import type { LlmAnalysis } from '../types/labResult';

export function useLlmAnalysis() {
  return useMutation<LlmAnalysis, Error, number | string>({
    mutationFn: (id: number | string) => llmApi.analyzeResult(id),
  });
}
