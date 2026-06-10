package com.lab.assistant.polling;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lab.assistant.labresult.AbnormalityEvaluator;
import com.lab.assistant.labresult.LabResult;
import com.lab.assistant.labresult.LabResultRepository;
import com.lab.assistant.logging.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class LabPollingServiceTest {

    @Mock
    private MockLabClient mockLabClient;

    @Mock
    private LabResultRepository repository;

    @Mock
    private AbnormalityEvaluator evaluator;

    @Mock
    private AuditLogService auditLogService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private LabPollingService pollingService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testSuccessfulIngest() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("resultId", "UUID-111");
        payload.put("deviceId", "DEVICE-01");
        payload.put("testCode", "BMP_GLU");
        payload.put("testName", "Açlık Glukozu");
        payload.put("value", 85.0);
        payload.put("referenceMin", 70.0);
        payload.put("referenceMax", 100.0);
        payload.put("collectedAt", "2026-06-09T10:00:00Z");
        payload.put("reportedAt", "2026-06-09T10:15:00Z");

        when(repository.existsByResultId("UUID-111")).thenReturn(false);
        when(evaluator.evaluate(any(), any(), any(), any())).thenReturn("NORMAL");

        pollingService.ingestResult(payload);

        ArgumentCaptor<LabResult> captor = ArgumentCaptor.forClass(LabResult.class);
        verify(repository).save(captor.capture());
        
        LabResult saved = captor.getValue();
        assertNotNull(saved);
        assertEquals("UUID-111", saved.getResultId());
        assertEquals("VALIDATED", saved.getStatus());
        assertEquals("NORMAL", saved.getSeverity());
        assertNull(saved.getValidationError());
    }

    @Test
    public void testMalformedValueIngest() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("resultId", "UUID-222");
        payload.put("deviceId", "DEVICE-01");
        payload.put("testCode", "BMP_GLU");
        payload.put("value", "YÜKSEK"); // Invalid double value
        payload.put("referenceMin", 70.0);
        payload.put("referenceMax", 100.0);

        when(repository.existsByResultId("UUID-222")).thenReturn(false);

        pollingService.ingestResult(payload);

        ArgumentCaptor<LabResult> captor = ArgumentCaptor.forClass(LabResult.class);
        verify(repository).save(captor.capture());

        LabResult saved = captor.getValue();
        assertNotNull(saved);
        assertEquals("UUID-222", saved.getResultId());
        assertEquals("INVALID", saved.getStatus());
        assertTrue(saved.getValidationError().contains("value is not a valid number"));
    }

    @Test
    public void testDuplicateIngestSkipped() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("resultId", "UUID-DUP");

        when(repository.existsByResultId("UUID-DUP")).thenReturn(true);

        pollingService.ingestResult(payload);

        verify(repository, never()).save(any());
    }
}
