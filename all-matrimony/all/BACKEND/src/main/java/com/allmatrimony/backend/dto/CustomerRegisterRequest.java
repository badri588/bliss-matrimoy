package com.allmatrimony.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CustomerRegisterRequest(
        @NotBlank(message = "userKey is required")
        String userKey,

        @NotBlank(message = "fullName is required")
        String fullName,

        @NotBlank(message = "phone is required")
        String phone,

        String email,
        String address,
        String city
) {
}
