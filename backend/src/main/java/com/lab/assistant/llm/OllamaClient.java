package com.lab.assistant.llm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class OllamaClient {

    private final RestTemplate restTemplate;

    @Value("${ollama.base-url}")
    private String baseUrl;

    @Value("${ollama.model}")
    private String modelName;

    public OllamaClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5 seconds connection timeout
        factory.setReadTimeout(60000);   // 60 seconds read timeout
        this.restTemplate = new RestTemplate(factory);
    }

    @SuppressWarnings("unchecked")
    public String generate(String prompt) {
        String url = baseUrl + "/api/generate";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelName);
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);
        requestBody.put("format", "json"); // Instruct Ollama to output valid JSON

        Map<String, Object> options = new HashMap<>();
        options.put("temperature", 0.1);
        requestBody.put("options", options);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        int maxRetries = 2;
        int delayMs = 500;

        for (int attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                log.info("Contacting Ollama at {} (attempt {})...", url, attempt);
                Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
                if (response != null && response.containsKey("response")) {
                    return (String) response.get("response");
                }
                throw new RuntimeException("Missing response field in Ollama output");
            } catch (Exception e) {
                log.warn("Ollama call failed on attempt {}: {}", attempt, e.getMessage());
                if (attempt > maxRetries) {
                    throw new LlmUnavailableException("Ollama service is unavailable: " + e.getMessage());
                }
                try {
                    Thread.sleep(delayMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new LlmUnavailableException("Ollama retry interrupted");
                }
                delayMs *= 2; // Exponential backoff
            }
        }
        throw new LlmUnavailableException("Failed to generate response from Ollama");
    }

    public static class LlmUnavailableException extends RuntimeException {
        public LlmUnavailableException(String message) {
            super(message);
        }
    }
}
