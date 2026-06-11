package com.allmatrimony.backend.dto;

public class InterestCreateRequest {
    private Long targetUserId;

    public Long getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(Long targetUserId) {
        this.targetUserId = targetUserId;
    }
}
