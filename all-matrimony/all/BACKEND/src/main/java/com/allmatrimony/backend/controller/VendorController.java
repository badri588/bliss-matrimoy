package com.allmatrimony.backend.controller;

import com.allmatrimony.backend.dto.ApiResponse;
import com.allmatrimony.backend.dto.LoginRequest;
import com.allmatrimony.backend.dto.OtpRequest;
import com.allmatrimony.backend.dto.OtpVerifyRequest;
import com.allmatrimony.backend.dto.VendorKycRequest;
import com.allmatrimony.backend.dto.VendorProfileUpdateRequest;
import com.allmatrimony.backend.dto.VendorRegisterRequest;
import com.allmatrimony.backend.dto.VendorServiceProfileRequest;
import com.allmatrimony.backend.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendVendorOtp(@Valid @RequestBody OtpRequest request) {
        return ResponseEntity.ok(vendorService.sendOtp(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyVendorOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(vendorService.verifyOtp(request));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerVendor(@Valid @RequestBody VendorRegisterRequest request) {
        return ResponseEntity.ok(vendorService.registerVendor(request));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> loginVendor(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(vendorService.loginVendor(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logoutVendor() {
        return ResponseEntity.ok(ApiResponse.success("Vendor logged out successfully."));
    }

    @PostMapping("/{vendorId}/kyc")
    public ResponseEntity<ApiResponse> submitKyc(
            @PathVariable Long vendorId,
            @Valid @RequestBody VendorKycRequest request
    ) {
        return ResponseEntity.ok(vendorService.submitKyc(vendorId, request));
    }

    @GetMapping("/{vendorId}")
    public ResponseEntity<ApiResponse> getVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(vendorService.getVendor(vendorId));
    }

    @PutMapping("/{vendorId}")
    public ResponseEntity<ApiResponse> updateVendorProfile(
            @PathVariable Long vendorId,
            @RequestBody VendorProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(vendorService.updateVendorProfile(vendorId, request));
    }

    @PutMapping("/{vendorId}/service-profile")
    public ResponseEntity<ApiResponse> updateServiceProfile(
            @PathVariable Long vendorId,
            @RequestBody VendorServiceProfileRequest request
    ) {
        return ResponseEntity.ok(vendorService.updateServiceProfile(vendorId, request));
    }
}
