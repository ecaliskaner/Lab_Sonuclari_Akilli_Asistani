package com.lab.mock.controller;

import com.lab.mock.generator.ScenarioType;
import com.lab.mock.generator.TestResultGenerator;
import com.lab.mock.model.RawLabResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/device")
@RequiredArgsConstructor
@Slf4j
public class LabDeviceController {

    private final TestResultGenerator generator;

    @GetMapping("/result")
    public ResponseEntity<RawLabResult> getSingleResult() {
        ScenarioType scenario = generator.determineScenario();
        log.info("Generating single result with scenario: {}", scenario);

        if (scenario == ScenarioType.DEVICE_ERROR) {
            log.warn("Device simulation encountered DEVICE_ERROR. Returning HTTP 503.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        RawLabResult result = generator.generateResult(scenario);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/results/batch")
    public ResponseEntity<List<RawLabResult>> getBatchResults() {
        ScenarioType batchScenario = generator.determineScenario();
        if (batchScenario == ScenarioType.DEVICE_ERROR) {
            log.warn("Device simulation batch encountered DEVICE_ERROR. Returning HTTP 503.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        int count = 1 + new java.util.Random().nextInt(5);
        log.info("Generating batch of {} results.", count);

        List<RawLabResult> results = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            // Roll scenarios for individuals in the batch, skipping DEVICE_ERROR to avoid breaking mid-batch
            ScenarioType itemScenario = generator.determineScenario();
            if (itemScenario == ScenarioType.DEVICE_ERROR) {
                itemScenario = ScenarioType.NORMAL;
            }
            RawLabResult result = generator.generateResult(itemScenario);
            if (result != null) {
                results.add(result);
            }
        }
        return ResponseEntity.ok(results);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> getHealth() {
        log.info("Checking mock device health status.");
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "deviceModel", "Beckman Coulter AU5800",
                "simulatedService", "ACTIVE"
        ));
    }

    @PostMapping("/scenario/override")
    public ResponseEntity<Map<String, String>> overrideScenario(@RequestBody Map<String, String> body) {
        String scenarioStr = body.get("scenario");
        if (scenarioStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "scenario field is required"));
        }

        try {
            ScenarioType scenario = ScenarioType.valueOf(scenarioStr.toUpperCase());
            generator.setOverride(scenario);
            log.info("Forced next generated result scenario to: {}", scenario);
            return ResponseEntity.ok(Map.of("message", "Next scenario overridden to " + scenario));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid scenario. Choose from: NORMAL, ABNORMAL_LOW, ABNORMAL_HIGH, CRITICAL, MALFORMED, DEVICE_ERROR"));
        }
    }
}
