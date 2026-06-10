package com.lab.assistant.labresult;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ReferenceRangeProvider {

    // Default multipliers for fallback evaluation
    private static final double DEFAULT_CRITICAL_LOW_MULTIPLIER = 0.5;
    private static final double DEFAULT_CRITICAL_HIGH_MULTIPLIER = 1.5;

    // Clinical overrides matching the spec table
    private static final Map<String, CriticalThresholds> OVERRIDES = Map.of(
            "CBC_WBC", new CriticalThresholds(2.0, 30.0),
            "CBC_HGB", new CriticalThresholds(7.0, 20.0),
            "CBC_PLT", new CriticalThresholds(50.0, 1000.0),
            "BMP_GLU", new CriticalThresholds(40.0, 500.0),
            "BMP_CRE", new CriticalThresholds(0.1, 10.0),
            "BMP_K", new CriticalThresholds(2.5, 6.5),
            "BMP_NA", new CriticalThresholds(120.0, 160.0),
            "LFT_ALT", new CriticalThresholds(1.0, 500.0),
            "LFT_AST", new CriticalThresholds(1.0, 500.0),
            "TSH", new CriticalThresholds(0.01, 100.0)
    );

    public double getCriticalLowThreshold(String testCode, double referenceMin) {
        if (OVERRIDES.containsKey(testCode)) {
            return OVERRIDES.get(testCode).getCriticalLow();
        }
        return referenceMin * DEFAULT_CRITICAL_LOW_MULTIPLIER;
    }

    public double getCriticalHighThreshold(String testCode, double referenceMax) {
        if (OVERRIDES.containsKey(testCode)) {
            return OVERRIDES.get(testCode).getCriticalHigh();
        }
        return referenceMax * DEFAULT_CRITICAL_HIGH_MULTIPLIER;
    }

    private static class CriticalThresholds {
        private final double criticalLow;
        private final double criticalHigh;

        public CriticalThresholds(double criticalLow, double criticalHigh) {
            this.criticalLow = criticalLow;
            this.criticalHigh = criticalHigh;
        }

        public double getCriticalLow() {
            return criticalLow;
        }

        public double getCriticalHigh() {
            return criticalHigh;
        }
    }
}
