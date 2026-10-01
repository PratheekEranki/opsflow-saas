package com.opsflow.dto.response;

import lombok.*;
import java.util.UUID;

@Data @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private UUID userId;
    private UUID organizationId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String organizationName;
    private String organizationSlug;
}
