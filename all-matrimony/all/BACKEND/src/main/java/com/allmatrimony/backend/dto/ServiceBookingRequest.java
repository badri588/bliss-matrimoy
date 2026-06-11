
package com.allmatrimony.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ServiceBookingRequest(
        Long userId,

        String userKey,

        String serviceId,

        Long vendorId,

        @NotBlank(message = "serviceTitle is required")
        String serviceTitle,

        String category,
        String location,
        String price,
        Integer paymentAmount,
        String packageName,
        String packagePrice,
        String bookingDate,
        String bookingEndDate,
        String bookingTime,
        String customerName,
        String phone,
        String email,
        String customerLocation
) {
}
