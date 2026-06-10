package com.lab.assistant.labresult;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AbnormalityEvaluator {

    private final ReferenceRangeProvider rangeProvider;

    public String evaluate(String testCode, Double value, Double referenceMin, Double referenceMax) {
        if (value == null) {
            throw new IllegalArgumentException("Test value cannot be null");
        }
        if (referenceMin == null || referenceMax == null) {
            return "NORMAL";
        }
        if (referenceMin > referenceMax) {
            throw new IllegalArgumentException("Reference minimum cannot be greater than reference maximum");
        }

        double criticalLow = rangeProvider.getCriticalLowThreshold(testCode, referenceMin);
        double criticalHigh = rangeProvider.getCriticalHighThreshold(testCode, referenceMax);

        if (value < criticalLow) {
            return "CRITICAL_LOW";
        } else if (value < referenceMin) {
            return "LOW";
        } else if (value > criticalHigh) {
            return "CRITICAL_HIGH";
        } else if (value > referenceMax) {
            return "HIGH";
        } else {
            return "NORMAL";
        }
    }
}
