package com.allmatrimony.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordOtpRequest {

    @Email(message = "Please enter a valid email address.")
    @NotBlank(message = "Email is required.")
    private String email;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
