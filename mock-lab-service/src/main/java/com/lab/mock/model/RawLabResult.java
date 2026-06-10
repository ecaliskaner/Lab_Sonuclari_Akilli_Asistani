package com.lab.mock.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RawLabResult {
    private String deviceId;
    private String deviceModel;
    private String resultId;
    private String patientRef;
    private Integer patientAge;
    private String patientGender;
    private String testCode;
    private String testName;
    private Object value; // Can be Double, String or null depending on ScenarioType
    private String unit;
    private Double referenceMin;
    private Double referenceMax;
    private Instant collectedAt;
    private Instant reportedAt;
    private String status;
}
