package com.allmatrimony.backend.controller;

import com.allmatrimony.backend.dto.ApiResponse;
import com.allmatrimony.backend.service.VendorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wedding-services")
public class WeddingServiceController {

    private final VendorService vendorService;

    public WeddingServiceController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getWeddingServices() {
        return ResponseEntity.ok(vendorService.getApprovedWeddingServices());
    }
}
