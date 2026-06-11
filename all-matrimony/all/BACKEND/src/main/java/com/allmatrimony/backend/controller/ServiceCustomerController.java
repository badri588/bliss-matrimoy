package com.allmatrimony.backend.controller;

import com.allmatrimony.backend.dto.CustomerRegisterRequest;
import com.allmatrimony.backend.dto.CustomerStatusResponse;
import com.allmatrimony.backend.service.ServiceCustomerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/service-customers")
public class ServiceCustomerController {

    private final ServiceCustomerService customerService;

    public ServiceCustomerController(ServiceCustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/status")
    public CustomerStatusResponse checkCustomerStatus(@RequestParam String userKey) {
        return customerService.checkStatus(userKey);
    }

    @PostMapping("/register")
    public CustomerStatusResponse registerCustomer(
            @Valid @RequestBody CustomerRegisterRequest request
    ) {
        return customerService.registerCustomer(request);
    }
}
