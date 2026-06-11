package com.allmatrimony.backend.controller;

import com.allmatrimony.backend.dto.ApiResponse;
import com.allmatrimony.backend.dto.ServiceBookingRequest;
import com.allmatrimony.backend.dto.ServiceBookingPaymentVerifyRequest;
import com.allmatrimony.backend.dto.StatusUpdateRequest;
import com.allmatrimony.backend.repository.ServiceRequestRepository;
import com.allmatrimony.backend.service.WeddingServiceBookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ServiceRequestController {

    private final WeddingServiceBookingService bookingService;
    private final ServiceRequestRepository serviceRequestRepository;

    public ServiceRequestController(
            WeddingServiceBookingService bookingService,
            ServiceRequestRepository serviceRequestRepository
    ) {
        this.bookingService = bookingService;
        this.serviceRequestRepository = serviceRequestRepository;
    }

    @PostMapping("/api/users/{userId}/service-requests")
    public ResponseEntity<ApiResponse> sendServiceRequest(
            @PathVariable Long userId,
            @Valid @RequestBody ServiceBookingRequest request
    ) {
        ServiceBookingRequest normalizedRequest = new ServiceBookingRequest(
                userId,
                request.userKey(),
                request.serviceId(),
                request.vendorId(),
                request.serviceTitle(),
                request.category(),
                request.location(),
                request.price(),
                request.paymentAmount(),
                request.packageName(),
                request.packagePrice(),
                request.bookingDate(),
                request.bookingEndDate(),
                request.bookingTime(),
                request.customerName(),
                request.phone(),
                request.email(),
                request.customerLocation()
        );

        return ResponseEntity.ok(ApiResponse.success(
                "Wedding service request processed.",
                bookingService.sendBookingRequest(normalizedRequest)
        ));
    }

    @PostMapping("/api/users/{userId}/service-booking-orders")
    public ResponseEntity<ApiResponse> createServiceBookingOrder(
            @PathVariable Long userId,
            @Valid @RequestBody ServiceBookingRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Service booking payment order created.",
                bookingService.createServiceBookingOrder(userId, request)
        ));
    }

    @PostMapping("/api/users/{userId}/service-booking-orders/verify")
    public ResponseEntity<ApiResponse> verifyServiceBookingPayment(
            @PathVariable Long userId,
            @Valid @RequestBody ServiceBookingPaymentVerifyRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Service booking payment verified.",
                bookingService.verifyServiceBookingPayment(userId, request)
        ));
    }

    @GetMapping("/api/users/{userId}/service-requests")
    public ResponseEntity<ApiResponse> getMyRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Wedding service requests fetched.",
                bookingService.getRequestsForUser(userId)
        ));
    }

    @GetMapping("/api/service-requests")
    public ResponseEntity<ApiResponse> getAllRequests() {
        List<?> requests = serviceRequestRepository.findAllByOrderByRequestedAtDesc();
        return ResponseEntity.ok(ApiResponse.success(
                "All wedding service requests fetched.",
                requests
        ));
    }

    @GetMapping("/api/vendors/{vendorId}/service-requests")
    public ResponseEntity<ApiResponse> getVendorRequests(@PathVariable Long vendorId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Vendor wedding service requests fetched.",
                bookingService.getRequestsForVendor(vendorId)
        ));
    }

    @PostMapping("/api/vendors/{vendorId}/service-requests/{requestId}/status")
    public ResponseEntity<ApiResponse> updateVendorRequestStatus(
            @PathVariable Long vendorId,
            @PathVariable Long requestId,
            @RequestBody(required = false) StatusUpdateRequest request
    ) {
        String nextStatus = request == null ? null : request.getStatus();
        String vendorMessage = request == null ? null : request.getAdminMessage();

        return ResponseEntity.ok(ApiResponse.success(
                "Vendor wedding service request updated.",
                bookingService.updateVendorRequestStatus(vendorId, requestId, nextStatus, vendorMessage)
        ));
    }

    @PostMapping("/api/admin/service-requests/{requestId}/status")
    public ResponseEntity<ApiResponse> updateRequestStatus(
            @PathVariable Long requestId,
            @RequestBody(required = false) StatusUpdateRequest request
    ) {
        String nextStatus = request == null ? null : request.getStatus();
        String adminMessage = request == null ? null : request.getAdminMessage();

        return ResponseEntity.ok(ApiResponse.success(
                "Wedding service request updated.",
                bookingService.updateRequestStatus(requestId, nextStatus, adminMessage)
        ));
    }
}
