package com.lab.assistant.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lab.assistant.auth.dto.LoginRequest;
import com.lab.assistant.config.RsaKeyProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Map;

import org.springframework.test.context.jdbc.Sql;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Sql("/db/migration/V4__seed_users.sql")
public class LabResultIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RsaKeyProvider rsaKeyProvider;

    @Test
    @SuppressWarnings("unchecked")
    public void testAuthAndAccessFlow() throws Exception {
        // 1. Fetch public key from endpoint
        MvcResult pkResult = mockMvc.perform(get("/api/auth/public-key"))
                .andExpect(status().isOk())
                .andReturn();
        
        String responseBody = pkResult.getResponse().getContentAsString();
        Map<String, String> pkMap = objectMapper.readValue(responseBody, Map.class);
        String publicKeyPem = pkMap.get("publicKey");

        // 2. Encrypt password on test side to simulate frontend behavior
        String cleanPem = publicKeyPem
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replace("\n", "")
                .replace("\r", "")
                .trim();
        byte[] decoded = Base64.getDecoder().decode(cleanPem);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PublicKey publicKey = kf.generatePublic(spec);

        // Simulates the frontend Web Crypto RSA-OAEP/SHA-256 behavior.
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        OAEPParameterSpec oaepSha256 = new OAEPParameterSpec(
                "SHA-256",
                "MGF1",
                MGF1ParameterSpec.SHA256,
                PSource.PSpecified.DEFAULT
        );
        cipher.init(Cipher.ENCRYPT_MODE, publicKey, oaepSha256);
        byte[] encryptedBytes = cipher.doFinal("Doctor123!".getBytes(StandardCharsets.UTF_8));
        String encryptedPassword = Base64.getEncoder().encodeToString(encryptedBytes);

        // 3. Perform login
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("dr.aydin@hastane.com");
        loginRequest.setPassword(encryptedPassword);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String loginResponseBody = loginResult.getResponse().getContentAsString();
        Map<String, Object> tokenMap = objectMapper.readValue(loginResponseBody, Map.class);
        String accessToken = (String) tokenMap.get("accessToken");

        // 4. Access protected endpoint with token
        mockMvc.perform(get("/api/lab-results")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        // 5. Access protected endpoint without token (should return 401 Unauthorized)
        mockMvc.perform(get("/api/lab-results"))
                .andExpect(status().isUnauthorized());

        // 6. Access admin endpoint with doctor token (should return 403 Forbidden)
        mockMvc.perform(get("/api/audit-logs")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isForbidden());
    }
}
