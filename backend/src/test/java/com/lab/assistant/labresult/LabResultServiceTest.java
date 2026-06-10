package com.lab.assistant.labresult;

import com.lab.assistant.labresult.dto.LabResultResponse;
import com.lab.assistant.labresult.dto.LabResultSummaryResponse;
import com.lab.assistant.logging.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class LabResultServiceTest {

    @Mock
    private LabResultRepository repository;

    @Mock
    private LabResultMapper mapper;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private LabResultService service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetFilteredResults() {
        Pageable pageable = PageRequest.of(0, 10);
        LabResult entity = new LabResult();
        entity.setId(1L);
        entity.setPatientRef("PT-100");

        Page<LabResult> page = new PageImpl<>(List.of(entity));
        when(repository.findFilteredResults(any(), any(), any(), any(), any(), any())).thenReturn(page);

        LabResultSummaryResponse summary = new LabResultSummaryResponse();
        summary.setId(1L);
        summary.setPatientRef("PT-100");
        when(mapper.toSummaryResponse(entity)).thenReturn(summary);

        Page<LabResultSummaryResponse> results = service.getFilteredResults("NORMAL", "BMP_GLU", "PT-100", null, null, pageable);

        assertNotNull(results);
        assertEquals(1, results.getTotalElements());
        assertEquals("PT-100", results.getContent().get(0).getPatientRef());
        verify(auditLogService).log(eq("LIST_RESULTS"), eq("LabResult"), any(), any());
    }

    @Test
    public void testGetResultByIdSuccess() {
        LabResult entity = new LabResult();
        entity.setId(1L);
        entity.setPatientRef("PT-100");
        when(repository.findById(1L)).thenReturn(Optional.of(entity));

        LabResultResponse response = new LabResultResponse();
        response.setId(1L);
        response.setPatientRef("PT-100");
        when(mapper.toResponse(entity)).thenReturn(response);

        LabResultResponse result = service.getResultById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(auditLogService).log(eq("VIEW_RESULT"), eq("LabResult"), eq("1"), any());
    }

    @Test
    public void testGetResultByIdNotFoundThrowsException() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(LabResultService.ResourceNotFoundException.class, () -> {
            service.getResultById(99L);
        });
    }
}
