export interface LabResult {
  id: number;
  deviceId: string;
  deviceModel: string;
  resultId: string;
  patientRef: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  testCode: string;
  testName: string;
  value: number | null;
  unit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  severity: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH';
  collectedAt: string;
  reportedAt: string;
  ingestedAt: string;
  rawPayload: string;
  validationError: string | null;
  status: 'RECEIVED' | 'VALIDATED' | 'INVALID';
}

export interface LabResultSummary {
  id: number;
  patientRef: string;
  testCode: string;
  testName: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  severity: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH';
  collectedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  empty: boolean;
}

export interface LlmAnalysis {
  clinicalSummary: string;
  urgencyLevel: 'ROUTINE' | 'URGENT' | 'CRITICAL';
  suggestedActions: string[];
  differentialHints: string[];
  disclaimer: string;
  llmAvailable: boolean;
  rawResponse?: string;
}

export interface LabResultStats {
  totalCount: number;
  abnormalCount: number;
  criticalCount: number;
}
