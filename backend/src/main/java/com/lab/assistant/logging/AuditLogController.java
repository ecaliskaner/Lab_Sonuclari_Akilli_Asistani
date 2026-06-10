package com.lab.assistant.logging;

import com.lab.assistant.logging.dto.AuditLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository repository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<AuditLog> logs = repository.filterLogs(action, userId, from, to, pageable);
        
        Page<AuditLogResponse> responsePage = logs.map(logEntry -> new AuditLogResponse(
                logEntry.getId(),
                logEntry.getRequestId(),
                logEntry.getUser() != null ? logEntry.getUser().getId() : null,
                logEntry.getUser() != null ? logEntry.getUser().getEmail() : null,
                logEntry.getUser() != null ? logEntry.getUser().getFullName() : null,
                logEntry.getAction(),
                logEntry.getEntityType(),
                logEntry.getEntityId(),
                logEntry.getDetail(),
                logEntry.getIpAddress(),
                logEntry.getCreatedAt()
        ));
        
        return ResponseEntity.ok(responsePage);
    }
}
