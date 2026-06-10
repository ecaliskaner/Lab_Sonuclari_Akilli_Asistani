package com.lab.assistant.polling;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lab.assistant.labresult.AbnormalityEvaluator;
import com.lab.assistant.labresult.LabResult;
import com.lab.assistant.labresult.LabResultRepository;
import com.lab.assistant.logging.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LabPollingService {

    private final MockLabClient mockLabClient;
    private final LabResultRepository repository;
    private final AbnormalityEvaluator evaluator;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelayString = "${lab.polling.interval-ms:30000}")
    public void pollAndIngest() {
        log.info("Starting scheduled mock lab polling loop...");
        try {
            Map<String, Object> payload = mockLabClient.fetchLatestResult();
            if (payload == null || payload.isEmpty()) {
                log.warn("Polled empty payload from mock lab service.");
                return;
            }
            
            ingestResult(payload);
            
        } catch (org.springframework.web.client.RestClientException e) {
            log.error("Network or timeout error while polling mock lab device: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error in polling service execution: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void ingestResult(Map<String, Object> payload) {
        String rawJson;
        try {
            rawJson = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.error("Failed to map raw payload to JSON string: {}", e.getMessage());
            rawJson = payload.toString();
        }

        String resultId = (String) payload.get("resultId");
        if (resultId == null || resultId.isBlank()) {
            log.error("Polled payload lacks a valid resultId. Ingest skipped.");
            return;
        }

        // Idempotency check:
        if (repository.existsByResultId(resultId)) {
            log.debug("Duplicate result detected. Ingestion skipped for resultId: {}", resultId);
            return;
        }

        LabResult result = LabResult.builder()
                .resultId(resultId)
                .deviceId((String) payload.get("deviceId"))
                .deviceModel((String) payload.get("deviceModel"))
                .patientRef((String) payload.get("patientRef"))
                .unit((String) payload.get("unit"))
                .testCode((String) payload.get("testCode"))
                .testName((String) payload.get("testName"))
                .rawPayload(rawJson)
                .build();

        // Parse dates safely
        result.setCollectedAt(parseInstant(payload.get("collectedAt")));
        result.setReportedAt(parseInstant(payload.get("reportedAt")));

        // Parse numbers safely
        result.setPatientAge(parseInteger(payload.get("patientAge")));
        result.setPatientGender((String) payload.get("patientGender"));
        result.setReferenceMin(parseDouble(payload.get("referenceMin")));
        result.setReferenceMax(parseDouble(payload.get("referenceMax")));

        // Validation rules
        StringBuilder validationError = new StringBuilder();
        Double testValue = null;

        if (result.getTestCode() == null || result.getTestCode().isBlank()) {
            validationError.append("testCode is missing; ");
        }

        Object valueObj = payload.get("value");
        if (valueObj == null) {
            validationError.append("value is missing/null; ");
        } else {
            try {
                testValue = parseDouble(valueObj);
                result.setValue(testValue);
            } catch (Exception e) {
                validationError.append("value is not a valid number (received: ").append(valueObj).append("); ");
            }
        }

        if (result.getReferenceMin() != null && result.getReferenceMax() != null) {
            if (result.getReferenceMin() > result.getReferenceMax()) {
                validationError.append("referenceMin is greater than referenceMax; ");
            }
            if (result.getReferenceMin() < 0 || result.getReferenceMax() < 0) {
                validationError.append("reference bounds cannot be negative; ");
            }
        }

        if (result.getPatientAge() != null && (result.getPatientAge() < 0 || result.getPatientAge() > 150)) {
            validationError.append("patientAge must be between 0 and 150; ");
        }

        if (result.getCollectedAt() != null && result.getCollectedAt().isAfter(Instant.now().plusSeconds(60))) {
            validationError.append("collectedAt cannot be in the future; ");
        }

        if (validationError.length() > 0) {
            result.setStatus("INVALID");
            result.setValidationError(validationError.toString());
            log.warn("Ingested malformed resultId={} as INVALID. Error: {}", resultId, validationError);
        } else {
            try {
                String severity = evaluator.evaluate(result.getTestCode(), testValue, result.getReferenceMin(), result.getReferenceMax());
                result.setSeverity(severity);
                result.setStatus("VALIDATED");
                
                if (severity.startsWith("CRITICAL")) {
                    log.warn("CRITICAL result ingested: resultId={}, test={}, value={}, severity={}", 
                            resultId, result.getTestCode(), testValue, severity);
                } else {
                    log.info("Validated result ingested: resultId={}, test={}, value={}, severity={}", 
                            resultId, result.getTestCode(), testValue, severity);
                }
            } catch (Exception e) {
                result.setStatus("INVALID");
                result.setValidationError("Abnormality evaluation failed: " + e.getMessage());
                log.error("Abnormality evaluation failed for resultId={}. Error: {}", resultId, e.getMessage());
            }
        }

        repository.save(result);
        
        auditLogService.log("INGEST_RESULT", "LabResult", String.valueOf(result.getId()), 
                String.format("Result ingested from device. resultId=%s, status=%s, severity=%s", 
                        resultId, result.getStatus(), result.getSeverity()));
    }

    private Double parseDouble(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number) {
            return ((Number) obj).doubleValue();
        }
        return Double.parseDouble(obj.toString());
    }

    private Integer parseInteger(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number) {
            return ((Number) obj).intValue();
        }
        return Integer.parseInt(obj.toString());
    }

    private Instant parseInstant(Object obj) {
        if (obj == null) return null;
        try {
            return Instant.parse(obj.toString());
        } catch (Exception e) {
            log.error("Failed to parse Instant string: {}", obj);
            return null;
        }
    }
}
