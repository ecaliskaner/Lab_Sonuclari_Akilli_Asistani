package com.lab.assistant.labresult;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class AbnormalityEvaluatorTest {

    private AbnormalityEvaluator evaluator;
    private ReferenceRangeProvider rangeProvider;

    @BeforeEach
    public void setUp() {
        rangeProvider = new ReferenceRangeProvider();
        evaluator = new AbnormalityEvaluator(rangeProvider);
    }

    @Test
    public void testNormalValue() {
        String severity = evaluator.evaluate("BMP_GLU", 85.0, 70.0, 100.0);
        assertEquals("NORMAL", severity);
    }

    @Test
    public void testLowValue() {
        // Potassium specific: ref min is 3.5, critical low is 2.5
        // 3.0 potassium should be LOW, not CRITICAL_LOW
        String severity = evaluator.evaluate("BMP_K", 3.0, 3.5, 5.1);
        assertEquals("LOW", severity);
    }

    @Test
    public void testCriticalLowValue() {
        String severity = evaluator.evaluate("BMP_K", 2.2, 3.5, 5.1);
        assertEquals("CRITICAL_LOW", severity);
    }

    @Test
    public void testHighValue() {
        String severity = evaluator.evaluate("BMP_GLU", 120.0, 70.0, 100.0);
        assertEquals("HIGH", severity);
    }

    @Test
    public void testCriticalHighValue() {
        String severity = evaluator.evaluate("BMP_GLU", 510.0, 70.0, 100.0);
        assertEquals("CRITICAL_HIGH", severity);
    }

    @Test
    public void testNullValueThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            evaluator.evaluate("BMP_GLU", null, 70.0, 100.0);
        });
    }

    @Test
    public void testInvalidRangeThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            evaluator.evaluate("BMP_GLU", 85.0, 100.0, 70.0);
        });
    }
}
