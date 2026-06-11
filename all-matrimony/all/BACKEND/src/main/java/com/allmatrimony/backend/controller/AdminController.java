package com.allmatrimony.backend.controller;

import com.allmatrimony.backend.dto.ApiResponse;
import com.allmatrimony.backend.dto.StatusUpdateRequest;
import com.allmatrimony.backend.service.MatrimonyService;
import com.allmatrimony.backend.service.VendorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final MatrimonyService matrimonyService;
    private final VendorService vendorService;

    public AdminController(MatrimonyService matrimonyService, VendorService vendorService) {
        this.matrimonyService = matrimonyService;
        this.vendorService = vendorService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        return ResponseEntity.ok(matrimonyService.getAllUsers());
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse> getAdminNotifications() {
        return ResponseEntity.ok(matrimonyService.getAdminNotifications());
    }

    @GetMapping("/approval-requests")
    public ResponseEntity<ApiResponse> getApprovalRequests() {
        return ResponseEntity.ok(matrimonyService.getApprovalRequests());
    }

    @PostMapping("/approval-requests/{requestId}/approve")
    public ResponseEntity<ApiResponse> approveProfile(
            @PathVariable Long requestId,
            @RequestBody(required = false) StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(matrimonyService.approveProfile(
                requestId,
                request == null ? new StatusUpdateRequest() : request
        ));
    }

    @PostMapping("/approval-requests/{requestId}/reject")
    public ResponseEntity<ApiResponse> rejectProfile(
            @PathVariable Long requestId,
            @RequestBody(required = false) StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(matrimonyService.rejectProfile(
                requestId,
                request == null ? new StatusUpdateRequest() : request
        ));
    }

    @GetMapping("/verification-requests")
    public ResponseEntity<ApiResponse> getVerificationRequests() {
        return ResponseEntity.ok(matrimonyService.getVerificationRequests());
    }

    @PostMapping("/verification-requests/{requestId}/approve")
    public ResponseEntity<ApiResponse> approveVerification(
            @PathVariable Long requestId,
            @RequestBody(required = false) StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(matrimonyService.updateVerificationStatus(
                requestId,
                "Approved",
                request == null ? new StatusUpdateRequest() : request
        ));
    }

    @PostMapping("/verification-requests/{requestId}/reject")
    public ResponseEntity<ApiResponse> rejectVerification(
            @PathVariable Long requestId,
            @RequestBody(required = false) StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(matrimonyService.updateVerificationStatus(
                requestId,
                "Rejected",
                request == null ? new StatusUpdateRequest() : request
        ));
    }

    @GetMapping("/vendor-approvals")
    public ResponseEntity<ApiResponse> getVendorApprovals() {
        return ResponseEntity.ok(vendorService.getVendorApprovals());
    }

    @GetMapping("/vendors")
    public ResponseEntity<ApiResponse> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @PostMapping("/vendor-approvals/{vendorId}/approve")
    public ResponseEntity<ApiResponse> approveVendor(
            @PathVariable Long vendorId,
            @RequestBody(required = false) StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(vendorService.approveVendor(
                vendorId,
                request == null ? new StatusUpdateRequest() : request
        ));
    }

    @PostMapping("/vendor-approvals/{vendorId}/reject")
    public ResponseEntity<ApiResponse> rejectVendor(
            @PathVariable Long vendorId,
            @RequestBody(required = false) StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(vendorService.rejectVendor(
                vendorId,
                request == null ? new StatusUpdateRequest() : request
        ));
    }
}
