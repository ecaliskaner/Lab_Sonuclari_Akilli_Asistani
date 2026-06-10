package com.lab.assistant.logging;

import com.lab.assistant.user.User;
import com.lab.assistant.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final HttpServletRequest httpServletRequest;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, String entityId, String detail) {
        String requestId = MDC.get("requestId");
        String ipAddress = "system";
        try {
            if (httpServletRequest != null) {
                ipAddress = httpServletRequest.getRemoteAddr();
            }
        } catch (Exception e) {
            log.trace("Could not resolve remote IP: {}", e.getMessage());
        }

        User currentUser = getCurrentUser().orElse(null);

        AuditLog logEntry = AuditLog.builder()
                .requestId(requestId)
                .user(currentUser)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .detail(detail)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(logEntry);
        log.info("Audit Logged: action={}, user={}, requestId={}", action, 
                currentUser != null ? currentUser.getEmail() : "system", requestId);
    }

    private Optional<User> getCurrentUser() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return Optional.empty();
        }
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email);
        }
        return Optional.empty();
    }
}
