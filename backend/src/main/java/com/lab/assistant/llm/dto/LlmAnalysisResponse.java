package com.lab.assistant.llm.dto;

import java.util.List;

public record LlmAnalysisResponse(
    String clinicalSummary,
    String urgencyLevel,        // ROUTINE | URGENT | CRITICAL
    List<String> suggestedActions,
    List<String> differentialHints,
    String disclaimer,
    boolean llmAvailable,       // false if fallback was triggered
    String rawResponse          // raw JSON for debugging
) {}
