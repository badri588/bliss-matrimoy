package com.allmatrimony.backend.controller;

import com.allmatrimony.backend.dto.ApiResponse;
import com.allmatrimony.backend.dto.ForgotPasswordOtpRequest;
import com.allmatrimony.backend.dto.ForgotPasswordResetRequest;
import com.allmatrimony.backend.dto.LoginRequest;
import com.allmatrimony.backend.dto.OtpRequest;
import com.allmatrimony.backend.dto.OtpVerifyRequest;
import com.allmatrimony.backend.dto.RegisterRequest;
import com.allmatrimony.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse> health() {
        return ResponseEntity.ok(ApiResponse.success("Backend is running."));
    }

    @PostMapping("/auth/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(@Valid @RequestBody OtpRequest request) {
        return ResponseEntity.ok(authService.sendOtp(request));
    }

    @PostMapping("/auth/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/auth/forgot-password/send-otp")
    public ResponseEntity<ApiResponse> sendForgotPasswordOtp(
            @Valid @RequestBody ForgotPasswordOtpRequest request
    ) {
        return ResponseEntity.ok(authService.sendForgotPasswordOtp(request));
    }

    @PostMapping("/auth/forgot-password/reset")
    public ResponseEntity<ApiResponse> resetForgotPassword(
            @Valid @RequestBody ForgotPasswordResetRequest request
    ) {
        return ResponseEntity.ok(authService.resetForgotPassword(request));
    }
}
