package com.lab.assistant.labresult;

import com.lab.assistant.labresult.dto.LabResultResponse;
import com.lab.assistant.labresult.dto.LabResultStatsResponse;
import com.lab.assistant.labresult.dto.LabResultSummaryResponse;
import com.lab.assistant.logging.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LabResultService {

    private final LabResultRepository repository;
    private final LabResultMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<LabResultSummaryResponse> getFilteredResults(
            String severity, String testCode, String patientRef, Instant from, Instant to, Pageable pageable) {

        log.debug("Querying filtered lab results: severity={}, testCode={}, patientRef={}", severity, testCode, patientRef);
        
        auditLogService.log("LIST_RESULTS", "LabResult", null, 
                String.format("Requested list of lab results with filter: severity=%s, testCode=%s, patientRef=%s", severity, testCode, patientRef));

        Page<LabResult> results = repository.findFilteredResults(severity, testCode, patientRef, from, to, pageable);
        return results.map(mapper::toSummaryResponse);
    }

    @Transactional
    public LabResultResponse getResultById(Long id) {
        log.info("Fetching details for lab result ID: {}", id);

        LabResult result = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found with ID: " + id));

        auditLogService.log("VIEW_RESULT", "LabResult", String.valueOf(result.getId()), 
                "Viewed detailed results of patient: " + result.getPatientRef());

        return mapper.toResponse(result);
    }

    @Transactional(readOnly = true)
    public List<String> getUniqueTestCodes() {
        return repository.findUniqueTestCodes();
    }

    @Transactional(readOnly = true)
    public LabResultStatsResponse getStats(
            String severity, String testCode, String patientRef, Instant from, Instant to) {
        log.debug("Calculating stats: severity={}, testCode={}, patientRef={}", severity, testCode, patientRef);
        long total = repository.countFiltered(severity, testCode, patientRef, from, to);
        long abnormal = repository.countAbnormalFiltered(severity, testCode, patientRef, from, to);
        long critical = repository.countCriticalFiltered(severity, testCode, patientRef, from, to);
        return new LabResultStatsResponse(total, abnormal, critical);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }
}
