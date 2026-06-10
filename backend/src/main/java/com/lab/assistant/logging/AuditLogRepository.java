package com.lab.assistant.logging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.user u WHERE " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:userId IS NULL OR u.id = :userId) AND " +
           "(cast(:fromDate as timestamp) IS NULL OR a.createdAt >= :fromDate) AND " +
           "(cast(:toDate as timestamp) IS NULL OR a.createdAt <= :toDate)")
    Page<AuditLog> filterLogs(
            @Param("action") String action,
            @Param("userId") Long userId,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate,
            Pageable pageable
    );
}
