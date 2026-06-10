package com.lab.assistant.auth;

import com.lab.assistant.auth.dto.LoginRequest;
import com.lab.assistant.auth.dto.TokenResponse;
import com.lab.assistant.config.RsaKeyProvider;
import com.lab.assistant.logging.AuditLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final RsaKeyProvider rsaKeyProvider;
    private final AuditLogService auditLogService;

    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        log.info("Public key requested by client.");
        return ResponseEntity.ok(Map.of("publicKey", rsaKeyProvider.getPublicKeyPem()));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        TokenResponse response = authService.login(loginRequest);
        
        // Audit log login action
        auditLogService.log("LOGIN", "User", String.valueOf(response.getUser().getId()), 
                "User successfully logged in with email: " + loginRequest.getEmail());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "refreshToken is required"));
        }
        
        Map<String, String> response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }
}
