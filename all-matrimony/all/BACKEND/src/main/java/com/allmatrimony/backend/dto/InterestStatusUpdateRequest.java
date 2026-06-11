package com.allmatrimony.backend.dto;

public class InterestStatusUpdateRequest {
    private Long actingUserId;
    private String status;
    private String message;

    public Long getActingUserId() {
        return actingUserId;
    }

    public void setActingUserId(Long actingUserId) {
        this.actingUserId = actingUserId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
