package com.lab.assistant.labresult.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class LabResultResponse {
    private Long id;
    private String deviceId;
    private String deviceModel;
    private String resultId;
    private String patientRef;
    private Integer patientAge;
    private String patientGender;
    private String testCode;
    private String testName;
    private Double value;
    private String unit;
    private Double referenceMin;
    private Double referenceMax;
    private String severity;
    private Instant collectedAt;
    private Instant reportedAt;
    private Instant ingestedAt;
    private String rawPayload;
    private String validationError;
    private String status;
}
