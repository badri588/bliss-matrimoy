package com.allmatrimony.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class OtpRequest {

    @NotBlank(message = "Phone number is required.")
    private String phone;

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
