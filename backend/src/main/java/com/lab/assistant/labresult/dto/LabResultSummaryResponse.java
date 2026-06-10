package com.lab.assistant.labresult.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class LabResultSummaryResponse {
    private Long id;
    private String patientRef;
    private String testCode;
    private String testName;
    private Double value;
    private String unit;
    private Double referenceMin;
    private Double referenceMax;
    private String severity;
    private Instant collectedAt;
}
