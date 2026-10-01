package com.opsflow.dto.request;

import lombok.Data;
import javax.validation.constraints.*;

@Data
public class RegisterOrganizationRequest {
    @NotBlank @Size(min = 2, max = 255)
    private String organizationName;

    @NotBlank @Size(min = 2, max = 100)
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    private String slug;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 2, max = 100)
    private String firstName;

    @NotBlank @Size(min = 2, max = 100)
    private String lastName;

    @NotBlank @Size(min = 8, max = 100)
    private String password;
}
