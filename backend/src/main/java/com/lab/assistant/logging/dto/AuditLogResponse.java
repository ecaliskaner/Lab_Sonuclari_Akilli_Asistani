package com.lab.assistant.logging.dto;

import java.time.Instant;

public record AuditLogResponse(
    Long id,
    String requestId,
    Long userId,
    String userEmail,
    String userFullName,
    String action,
    String entityType,
    String entityId,
    String detail,
    String ipAddress,
    Instant createdAt
) {}
