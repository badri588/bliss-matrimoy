package com.allmatrimony.backend.service;

import org.springframework.stereotype.Service;

import com.allmatrimony.backend.dto.CustomerRegisterRequest;
import com.allmatrimony.backend.dto.CustomerStatusResponse;
import com.allmatrimony.backend.entity.ServiceCustomer;
import com.allmatrimony.backend.repository.ServiceCustomerRepository;

@Service
public class ServiceCustomerService {
    private static final java.util.regex.Pattern PHONE_PATTERN =
            java.util.regex.Pattern.compile("^[6-9]\\d{9}$");

    private final ServiceCustomerRepository customerRepository;

    public ServiceCustomerService(ServiceCustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerStatusResponse checkStatus(String userKey) {
        return customerRepository.findByUserKey(userKey)
                .map(customer -> new CustomerStatusResponse(
                        true,
                        customer.isServiceApproved(),
                        customer.getId(),
                        customer.getFullName(),
                        customer.getPhone(),
                        "Customer already registered"
                ))
                .orElse(new CustomerStatusResponse(
                        false,
                        false,
                        null,
                        null,
                        null,
                        "Customer registration required"
                ));
    }

    public CustomerStatusResponse registerCustomer(CustomerRegisterRequest request) {
        String phone = request.phone() == null ? "" : request.phone().trim();

        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new RuntimeException("Please enter a valid 10-digit phone number.");
        }

        if (customerRepository.existsByUserKey(request.userKey())) {
            ServiceCustomer existing = customerRepository.findByUserKey(request.userKey()).orElseThrow();

            return new CustomerStatusResponse(
                    true,
                    existing.isServiceApproved(),
                    existing.getId(),
                    existing.getFullName(),
                    existing.getPhone(),
                    "Customer already registered"
            );
        }

        if (customerRepository.existsByPhone(phone)) {
            throw new RuntimeException("This phone number is already registered");
        }

        ServiceCustomer customer = new ServiceCustomer();
        customer.setUserKey(request.userKey());
        customer.setFullName(request.fullName());
        customer.setPhone(phone);
        customer.setEmail(request.email());
        customer.setAddress(request.address());
        customer.setCity(request.city());

        ServiceCustomer saved = customerRepository.save(customer);

        return new CustomerStatusResponse(
                true,
                saved.isServiceApproved(),
                saved.getId(),
                saved.getFullName(),
                saved.getPhone(),
                "Customer registered successfully"
        );
    }
}
