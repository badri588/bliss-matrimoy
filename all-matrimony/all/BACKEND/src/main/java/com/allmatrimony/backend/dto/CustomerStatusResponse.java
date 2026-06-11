package com.allmatrimony.backend.dto;

public record CustomerStatusResponse(
        boolean registered,
        boolean approved,
        Long customerId,
        String fullName,
        String phone,
        String message
) {
}
