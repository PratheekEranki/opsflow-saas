package com.opsflow.service;

import com.opsflow.dto.request.*;
import com.opsflow.dto.response.AuthResponse;
import com.opsflow.entity.*;
import com.opsflow.exception.*;
import com.opsflow.kafka.producer.AuditEventProducer;
import com.opsflow.repository.*;
import com.opsflow.security.jwt.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuditEventProducer auditEventProducer;

    @Transactional
    public AuthResponse register(RegisterOrganizationRequest req) {
        log.info("[REGISTER] Attempt: orgName={}, slug={}, email={}, firstName={}, lastName={}", req.getOrganizationName(), req.getSlug(), req.getEmail(), req.getFirstName(), req.getLastName());
        if (organizationRepository.existsBySlug(req.getSlug())) {
            throw new ConflictException("Organization slug already taken: " + req.getSlug());
        }

        Organization org = Organization.builder()
                .name(req.getOrganizationName())
                .slug(req.getSlug())
                .ownerEmail(req.getEmail())
                .plan(Organization.Plan.FREE)
                .build();
        org = organizationRepository.save(org);
        log.info("[REGISTER] Organization created: id={}, name={}, slug={}", org.getId(), org.getName(), org.getSlug());

        User admin = User.builder()
                .organization(org)
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .role(User.Role.ADMIN)
                .emailVerified(true)
                .build();
        admin = userRepository.save(admin);
        log.info("[REGISTER] Admin user created: id={}, email={}, role={}, orgId={}", admin.getId(), admin.getEmail(), admin.getRole(), org.getId());

        try {
            auditEventProducer.publish("ORGANIZATION_CREATED", "ORGANIZATION", org.getId(),
                    null, org, admin.getId(), null);
        } catch (Exception e) {
            log.warn("Kafka unavailable, skipping audit event: {}", e.getMessage());
        }

        String accessToken = jwtUtils.generateAccessToken(
                admin.getId(), org.getId(), admin.getEmail(), admin.getRole().name());
        String refreshToken = jwtUtils.generateRefreshToken(admin.getId());

        log.info("[REGISTER] SUCCESS: Account created for {} in org {} ({})", admin.getEmail(), org.getName(), org.getSlug());
        return buildAuthResponse(admin, org, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        log.info("[LOGIN] Attempt: email={}, orgSlug={}", req.getEmail(), req.getOrganizationSlug());
        // Find user by email (with optional org slug)
        User user;
        if (req.getOrganizationSlug() != null) {
            Organization org = organizationRepository.findBySlug(req.getOrganizationSlug())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
            user = userRepository.findByOrganizationIdAndEmail(org.getId(), req.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        } else {
            user = userRepository.findByEmail(req.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new DisabledException("Account is deactivated");
        }

        Organization org = user.getOrganization();
        log.info("[LOGIN] SUCCESS: user={}, role={}, org={}", user.getEmail(), user.getRole(), org.getSlug());
        String accessToken = jwtUtils.generateAccessToken(
                user.getId(), org.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtils.generateRefreshToken(user.getId());

        return buildAuthResponse(user, org, accessToken, refreshToken);
    }

    private AuthResponse buildAuthResponse(User user, Organization org, String access, String refresh) {
        return AuthResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .userId(user.getId())
                .organizationId(org.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .organizationName(org.getName())
                .organizationSlug(org.getSlug())
                .build();
    }
}
