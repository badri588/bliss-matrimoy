package com.allmatrimony.backend.controller;

import com.allmatrimony.backend.dto.ApiResponse;
import com.allmatrimony.backend.dto.PremiumOrderRequest;
import com.allmatrimony.backend.dto.PremiumPaymentVerifyRequest;
import com.allmatrimony.backend.service.PremiumService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/premium")
public class PremiumController {
    private final PremiumService premiumService;

    public PremiumController(PremiumService premiumService) {
        this.premiumService = premiumService;
    }

    @GetMapping("/plans/{userId}")
    public ResponseEntity<ApiResponse> getPlans(@PathVariable Long userId) {
        return ResponseEntity.ok(premiumService.getPremiumPlans(userId));
    }

    @PostMapping("/orders/{userId}")
    public ResponseEntity<ApiResponse> createOrder(
            @PathVariable Long userId,
            @Valid @RequestBody PremiumOrderRequest request
    ) {
        return ResponseEntity.ok(premiumService.createPremiumOrder(userId, request));
    }

    @PostMapping("/verify/{userId}")
    public ResponseEntity<ApiResponse> verifyPayment(
            @PathVariable Long userId,
            @Valid @RequestBody PremiumPaymentVerifyRequest request
    ) {
        return ResponseEntity.ok(premiumService.verifyPremiumPayment(userId, request));
    }
}
