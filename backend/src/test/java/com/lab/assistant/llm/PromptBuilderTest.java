package com.lab.assistant.llm;

import com.lab.assistant.labresult.LabResult;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class PromptBuilderTest {

    @Test
    public void testPromptStructure() {
        PromptBuilder builder = new PromptBuilder();
        LabResult result = LabResult.builder()
                .testName("Potasyum")
                .testCode("BMP_K")
                .value(5.8)
                .unit("mEq/L")
                .referenceMin(3.5)
                .referenceMax(5.1)
                .severity("HIGH")
                .patientAge(45)
                .patientGender("M")
                .patientRef("PT-99999")
                .build();

        String prompt = builder.buildPrompt(result);

        assertNotNull(prompt);
        assertTrue(prompt.contains("BMP_K"));
        assertTrue(prompt.contains("Potasyum"));
        assertTrue(prompt.contains("5.8"));
        assertTrue(prompt.contains("mEq/L"));
        assertTrue(prompt.contains("45"));
        assertTrue(prompt.contains("Erkek"));
        assertTrue(prompt.contains("HIGH"));
    }
}
