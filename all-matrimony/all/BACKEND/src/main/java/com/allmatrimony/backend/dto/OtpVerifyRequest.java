package com.allmatrimony.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class OtpVerifyRequest {

    @NotBlank(message = "Phone number is required.")
    private String phone;

    @NotBlank(message = "OTP is required.")
    private String otp;

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
