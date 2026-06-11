package com.allmatrimony.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class PremiumPaymentVerifyRequest {
    @NotBlank(message = "Plan code is required.")
    private String planCode;

    @NotBlank(message = "Razorpay order ID is required.")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay payment ID is required.")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay signature is required.")
    private String razorpaySignature;

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public String getRazorpaySignature() {
        return razorpaySignature;
    }

    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }
}
