package com.opsflow.dto.request;

import com.opsflow.entity.User;
import lombok.Data;
import javax.validation.constraints.*;

@Data
public class InviteUserRequest {
    @NotBlank @Email
    private String email;

    @NotNull
    private User.Role role;
}
