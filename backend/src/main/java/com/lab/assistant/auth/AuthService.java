package com.lab.assistant.auth;

import com.lab.assistant.auth.dto.LoginRequest;
import com.lab.assistant.auth.dto.TokenResponse;
import com.lab.assistant.config.RsaKeyProvider;
import com.lab.assistant.user.User;
import com.lab.assistant.user.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RsaKeyProvider rsaKeyProvider;

    @Value("${lab.jwt.expiration-ms}")
    private long jwtExpirationMs;

    public TokenResponse login(LoginRequest request) {
        log.info("Attempting login for user: {}", request.getEmail());

        // 1. Decrypt password using RSA Private Key
        String plainPassword;
        try {
            plainPassword = rsaKeyProvider.decrypt(request.getPassword());
        } catch (Exception e) {
            log.error("Failed to decrypt RSA password for: {}. Error: {}", request.getEmail(), e.getMessage());
            throw new BadCredentialsException("E-posta veya şifre hatalı");
        }

        // 2. Fetch user from DB
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("E-posta veya şifre hatalı"));

        if (!user.isActive()) {
            throw new BadCredentialsException("Hesap devre dışı bırakılmış");
        }

        // 3. Verify password via BCrypt
        if (!passwordEncoder.matches(plainPassword, user.getPassword())) {
            log.warn("Invalid password attempt for user: {}", request.getEmail());
            throw new BadCredentialsException("E-posta veya şifre hatalı");
        }

        // 4. Generate access and refresh tokens
        String roleStr = user.getRole().name();
        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getId(), roleStr);
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getId(), roleStr);

        log.info("User {} successfully authenticated.", user.getEmail());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtExpirationMs / 1000)
                .user(TokenResponse.UserInfo.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .role(roleStr)
                        .build())
                .build();
    }

    public Map<String, String> refreshToken(String refreshToken) {
        log.info("Attempting to refresh token");
        Claims claims = jwtUtil.extractClaims(refreshToken);
        if (claims == null) {
            throw new BadCredentialsException("Geçersiz yenileme belirteci");
        }

        String email = claims.getSubject();
        Long userId = claims.get("userId", Long.class);
        String role = claims.get("role", String.class);

        if (jwtUtil.validateToken(refreshToken, email)) {
            String newAccessToken = jwtUtil.generateAccessToken(email, userId, role);
            log.info("Successfully refreshed access token for: {}", email);
            return Map.of(
                    "accessToken", newAccessToken,
                    "expiresIn", String.valueOf(jwtExpirationMs / 1000)
            );
        } else {
            throw new BadCredentialsException("Yenileme belirtecinin süresi dolmuş veya geçersiz");
        }
    }
}
