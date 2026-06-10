export interface AuditLog {
  id: number;
  requestId: string;
  userId: number | null;
  userEmail: string | null;
  userFullName: string | null;
  action: string;
  entityType: string;
  entityId: string;
  detail: string;
  ipAddress: string;
  createdAt: string;
}
