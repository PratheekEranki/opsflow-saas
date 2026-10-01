package com.opsflow.controller;

import com.opsflow.entity.Organization;
import com.opsflow.entity.User;
import com.opsflow.repository.OrganizationRepository;
import com.opsflow.repository.UserRepository;
import com.opsflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<User>> listMembers() {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(userRepository.findByOrganizationIdAndActiveTrue(orgId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> addMember(@RequestBody AddMemberRequest req) {
        UUID orgId = SecurityUtils.getCurrentOrgId();

        // guard: no duplicate email within org
        userRepository.findByOrganizationIdAndEmail(orgId, req.getEmail()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists in this organization");
        });

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        User.Role role = User.Role.MEMBER;
        if (req.getRole() != null) {
            try { role = User.Role.valueOf(req.getRole().toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        User member = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .organization(org)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.save(member));
    }

    @lombok.Data
    static class AddMemberRequest {
        @NotBlank String firstName;
        @NotBlank String lastName;
        @Email @NotBlank String email;
        @NotBlank String password;
        String role; // MEMBER | MANAGER | ADMIN (defaults to MEMBER)
    }
}
