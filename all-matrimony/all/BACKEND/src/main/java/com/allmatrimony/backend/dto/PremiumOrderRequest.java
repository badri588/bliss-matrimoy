package com.allmatrimony.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class PremiumOrderRequest {
    @NotBlank(message = "Plan code is required.")
    private String planCode;

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }
}
