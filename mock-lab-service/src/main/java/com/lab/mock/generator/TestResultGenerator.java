package com.lab.mock.generator;

import com.lab.mock.model.RawLabResult;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class TestResultGenerator {

    private final Random random = new Random();
    private final AtomicReference<ScenarioType> scenarioOverride = new AtomicReference<>(null);

    // List of test definitions matching the spec table
    private static final List<TestDefinition> TESTS = List.of(
            new TestDefinition("CBC_WBC", "Beyaz Kan Hücresi", "10³/µL", 4.5, 11.0, 2.0, 30.0),
            new TestDefinition("CBC_HGB", "Hemoglobin", "g/dL", 12.0, 17.5, 7.0, 20.0),
            new TestDefinition("CBC_PLT", "Trombosit", "10³/µL", 150.0, 400.0, 50.0, 1000.0),
            new TestDefinition("BMP_GLU", "Açlık Glukozu", "mg/dL", 70.0, 100.0, 40.0, 500.0),
            new TestDefinition("BMP_CRE", "Kreatinin", "mg/dL", 0.6, 1.2, 0.1, 10.0),
            new TestDefinition("BMP_K", "Potasyum", "mEq/L", 3.5, 5.1, 2.5, 6.5),
            new TestDefinition("BMP_NA", "Sodyum", "mEq/L", 136.0, 145.0, 120.0, 160.0),
            new TestDefinition("LFT_ALT", "ALT", "U/L", 7.0, 56.0, 1.0, 500.0),
            new TestDefinition("LFT_AST", "AST", "U/L", 10.0, 40.0, 1.0, 500.0),
            new TestDefinition("TSH", "TSH", "µIU/mL", 0.4, 4.0, 0.01, 100.0)
    );

    public void setOverride(ScenarioType scenario) {
        this.scenarioOverride.set(scenario);
    }

    public ScenarioType determineScenario() {
        ScenarioType override = scenarioOverride.getAndSet(null);
        if (override != null) {
            return override;
        }

        int roll = random.nextInt(100);
        if (roll < 55) return ScenarioType.NORMAL;         // 55%
        if (roll < 70) return ScenarioType.ABNORMAL_LOW;   // 15%
        if (roll < 85) return ScenarioType.ABNORMAL_HIGH;  // 15%
        if (roll < 95) return ScenarioType.CRITICAL;       // 10%
        if (roll < 98) return ScenarioType.MALFORMED;      // 3%
        return ScenarioType.DEVICE_ERROR;                  // 2%
    }

    public RawLabResult generateResult(ScenarioType scenario) {
        TestDefinition test = TESTS.get(random.nextInt(TESTS.size()));
        
        String patientRef = "PT-" + String.format("%05d", random.nextInt(10000));
        int patientAge = 18 + random.nextInt(70);
        String patientGender = random.nextBoolean() ? "M" : "F";
        
        Instant reportedAt = Instant.now();
        Instant collectedAt = reportedAt.minus(15 + random.nextInt(45), ChronoUnit.MINUTES);

        RawLabResult.RawLabResultBuilder builder = RawLabResult.builder()
                .deviceId("LAB-DEVICE-001")
                .deviceModel("Beckman Coulter AU5800")
                .resultId(UUID.randomUUID().toString())
                .patientRef(patientRef)
                .patientAge(patientAge)
                .patientGender(patientGender)
                .testCode(test.code)
                .testName(test.name)
                .unit(test.unit)
                .referenceMin(test.refMin)
                .referenceMax(test.refMax)
                .collectedAt(collectedAt)
                .reportedAt(reportedAt)
                .status("FINAL");

        double value = 0.0;

        switch (scenario) {
            case NORMAL:
                value = test.refMin + (test.refMax - test.refMin) * random.nextDouble();
                builder.value(round(value));
                break;
            case ABNORMAL_LOW:
                // referenceMin * 0.5 <= value < referenceMin
                value = (test.refMin * 0.5) + (test.refMin - (test.refMin * 0.5)) * random.nextDouble();
                builder.value(round(value));
                break;
            case ABNORMAL_HIGH:
                // referenceMax < value <= referenceMax * 1.5
                value = test.refMax + ((test.refMax * 1.5) - test.refMax) * random.nextDouble();
                builder.value(round(value));
                break;
            case CRITICAL:
                // Hayati tehlike sınırlarında: < critMin veya > critMax
                if (random.nextBoolean()) {
                    // Critical Low
                    value = test.critMin * random.nextDouble();
                } else {
                    // Critical High
                    value = test.critMax + (test.critMax * 0.5) * random.nextDouble();
                }
                builder.value(round(value));
                break;
            case MALFORMED:
                int type = random.nextInt(4);
                if (type == 0) {
                    // Type 1: String value
                    builder.value(random.nextBoolean() ? "YÜKSEK" : "BELİRSİZ");
                } else if (type == 1) {
                    // Type 2: Missing testCode
                    builder.testCode(null);
                    value = test.refMin + (test.refMax - test.refMin) * random.nextDouble();
                    builder.value(round(value));
                } else if (type == 2) {
                    // Type 3: Null value
                    builder.value(null);
                } else {
                    // Type 4: Invalid/negative references
                    builder.referenceMin(-999.0);
                    builder.referenceMax(-1.0);
                    value = test.refMin + (test.refMax - test.refMin) * random.nextDouble();
                    builder.value(round(value));
                }
                break;
            case DEVICE_ERROR:
                // This scenario is handled at controller level to return HTTP 503
                return null;
        }

        return builder.build();
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    private static class TestDefinition {
        String code;
        String name;
        String unit;
        double refMin;
        double refMax;
        double critMin;
        double critMax;

        TestDefinition(String code, String name, String unit, double refMin, double refMax, double critMin, double critMax) {
            this.code = code;
            this.name = name;
            this.unit = unit;
            this.refMin = refMin;
            this.refMax = refMax;
            this.critMin = critMin;
            this.critMax = critMax;
        }
    }
}
