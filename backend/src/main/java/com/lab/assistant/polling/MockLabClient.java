package com.lab.assistant.polling;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class MockLabClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${lab.polling.base-url}")
    private String baseUrl;

    @SuppressWarnings("unchecked")
    public Map<String, Object> fetchLatestResult() {
        String url = baseUrl + "/api/device/result";
        return restTemplate.getForObject(url, Map.class);
    }
}
