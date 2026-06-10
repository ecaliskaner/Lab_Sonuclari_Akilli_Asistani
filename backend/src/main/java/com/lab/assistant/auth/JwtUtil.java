package com.lab.assistant.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class JwtUtil {

    @Value("${lab.jwt.secret}")
    private String secretString;

    @Value("${lab.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${lab.jwt.refresh-expiration-ms}")
    private long jwtRefreshExpirationMs;

    private SecretKey key;

    @PostConstruct
    public void init() {
        if (secretString == null || secretString.length() < 32) {
            log.warn("JWT secret key is too short or null! Generating a fallback secure key.");
            this.key = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS256);
        } else {
            this.key = Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
        }
    }

    public String generateAccessToken(String email, Long userId, String role) {
        return generateToken(email, userId, role, jwtExpirationMs);
    }

    public String generateRefreshToken(String email, Long userId, String role) {
        return generateToken(email, userId, role, jwtRefreshExpirationMs);
    }

    private String generateToken(String email, Long userId, String role, long expirationMs) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    public Claims extractClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Failed to parse JWT claims: {}", e.getMessage());
            return null;
        }
    }

    public String extractEmail(String token) {
        Claims claims = extractClaims(token);
        return claims != null ? claims.getSubject() : null;
    }

    public boolean validateToken(String token, String email) {
        Claims claims = extractClaims(token);
        if (claims == null) return false;
        
        String tokenEmail = claims.getSubject();
        boolean isExpired = claims.getExpiration().before(new Date());
        
        return (tokenEmail.equals(email) && !isExpired);
    }
}
