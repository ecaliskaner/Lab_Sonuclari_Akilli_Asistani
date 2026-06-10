package com.lab.assistant.labresult;

import com.lab.assistant.labresult.dto.LabResultResponse;
import com.lab.assistant.labresult.dto.LabResultStatsResponse;
import com.lab.assistant.labresult.dto.LabResultSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

import com.lab.assistant.llm.LlmService;
import com.lab.assistant.llm.dto.LlmAnalysisResponse;

@RestController
@RequestMapping("/api/lab-results")
@RequiredArgsConstructor
public class LabResultController {

    private final LabResultService service;
    private final LlmService llmService;

    @PostMapping("/{id}/analyze")
    public ResponseEntity<LlmAnalysisResponse> analyzeResult(@PathVariable Long id) {
        LlmAnalysisResponse response = llmService.analyzeResult(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<LabResultSummaryResponse>> getResults(
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String testCode,
            @RequestParam(required = false) String patientRef,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @PageableDefault(size = 20, sort = "ingestedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<LabResultSummaryResponse> results = service.getFilteredResults(
                severity, testCode, patientRef, from, to, pageable);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabResultResponse> getResultById(@PathVariable Long id) {
        LabResultResponse response = service.getResultById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<LabResultStatsResponse> getStats(
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String testCode,
            @RequestParam(required = false) String patientRef,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        
        LabResultStatsResponse stats = service.getStats(severity, testCode, patientRef, from, to);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/test-codes")
    public ResponseEntity<List<String>> getUniqueTestCodes() {
        List<String> testCodes = service.getUniqueTestCodes();
        return ResponseEntity.ok(testCodes);
    }
}
