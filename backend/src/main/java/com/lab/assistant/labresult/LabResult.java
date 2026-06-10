package com.lab.assistant.labresult;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "lab_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", length = 100)
    private String deviceId;

    @Column(name = "device_model", length = 200)
    private String deviceModel;

    @Column(name = "result_id", unique = true, nullable = false, length = 100)
    private String resultId;

    @Column(name = "patient_ref", length = 100)
    private String patientRef;

    @Column(name = "patient_age")
    private Integer patientAge;

    @Column(name = "patient_gender", length = 10)
    private String patientGender;

    @Column(name = "test_code", nullable = false, length = 50)
    private String testCode;

    @Column(name = "test_name", length = 200)
    private String testName;

    @Column(name = "`value`")
    private Double value; // Numerical value parsed from raw payload

    @Column(length = 50)
    private String unit;

    @Column(name = "reference_min")
    private Double referenceMin;

    @Column(name = "reference_max")
    private Double referenceMax;

    @Column(length = 50)
    private String severity; // NORMAL | LOW | HIGH | CRITICAL_LOW | CRITICAL_HIGH

    @Column(name = "collected_at")
    private Instant collectedAt;

    @Column(name = "reported_at")
    private Instant reportedAt;

    @Column(name = "ingested_at", insertable = false, updatable = false)
    private Instant ingestedAt;

    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;

    @Column(name = "validation_error", length = 500)
    private String validationError;

    @Column(length = 50)
    @Builder.Default
    private String status = "RECEIVED"; // RECEIVED | VALIDATED | INVALID
}
