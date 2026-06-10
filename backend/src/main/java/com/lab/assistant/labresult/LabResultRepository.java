package com.lab.assistant.labresult;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface LabResultRepository extends JpaRepository<LabResult, Long> {

    Optional<LabResult> findByResultId(String resultId);

    boolean existsByResultId(String resultId);

    @Query("SELECT l FROM LabResult l WHERE " +
           "(:severity IS NULL OR l.severity = :severity) AND " +
           "(:testCode IS NULL OR l.testCode = :testCode) AND " +
           "(:patientRef IS NULL OR l.patientRef = :patientRef) AND " +
           "(cast(:fromDate as timestamp) IS NULL OR l.collectedAt >= :fromDate) AND " +
           "(cast(:toDate as timestamp) IS NULL OR l.collectedAt <= :toDate) AND " +
           "l.status = 'VALIDATED'")
    Page<LabResult> findFilteredResults(
            @Param("severity") String severity,
            @Param("testCode") String testCode,
            @Param("patientRef") String patientRef,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate,
            Pageable pageable
    );

    @Query("SELECT DISTINCT l.testCode FROM LabResult l WHERE l.status = 'VALIDATED' ORDER BY l.testCode")
    List<String> findUniqueTestCodes();

    @Query("SELECT COUNT(l) FROM LabResult l WHERE " +
           "(:severity IS NULL OR l.severity = :severity) AND " +
           "(:testCode IS NULL OR l.testCode = :testCode) AND " +
           "(:patientRef IS NULL OR l.patientRef = :patientRef) AND " +
           "(cast(:fromDate as timestamp) IS NULL OR l.collectedAt >= :fromDate) AND " +
           "(cast(:toDate as timestamp) IS NULL OR l.collectedAt <= :toDate) AND " +
           "l.status = 'VALIDATED'")
    long countFiltered(
            @Param("severity") String severity,
            @Param("testCode") String testCode,
            @Param("patientRef") String patientRef,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate
    );

    @Query("SELECT COUNT(l) FROM LabResult l WHERE " +
           "(:severity IS NULL OR l.severity = :severity) AND " +
           "(:testCode IS NULL OR l.testCode = :testCode) AND " +
           "(:patientRef IS NULL OR l.patientRef = :patientRef) AND " +
           "(cast(:fromDate as timestamp) IS NULL OR l.collectedAt >= :fromDate) AND " +
           "(cast(:toDate as timestamp) IS NULL OR l.collectedAt <= :toDate) AND " +
           "l.severity != 'NORMAL' AND " +
           "l.status = 'VALIDATED'")
    long countAbnormalFiltered(
            @Param("severity") String severity,
            @Param("testCode") String testCode,
            @Param("patientRef") String patientRef,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate
    );

    @Query("SELECT COUNT(l) FROM LabResult l WHERE " +
           "(:severity IS NULL OR l.severity = :severity) AND " +
           "(:testCode IS NULL OR l.testCode = :testCode) AND " +
           "(:patientRef IS NULL OR l.patientRef = :patientRef) AND " +
           "(cast(:fromDate as timestamp) IS NULL OR l.collectedAt >= :fromDate) AND " +
           "(cast(:toDate as timestamp) IS NULL OR l.collectedAt <= :toDate) AND " +
           "l.severity IN ('CRITICAL_LOW', 'CRITICAL_HIGH') AND " +
           "l.status = 'VALIDATED'")
    long countCriticalFiltered(
            @Param("severity") String severity,
            @Param("testCode") String testCode,
            @Param("patientRef") String patientRef,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate
    );
}
