package com.allmatrimony.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.allmatrimony.backend.entity.ServiceRequest;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    List<ServiceRequest> findAllByOrderByRequestedAtDesc();

    List<ServiceRequest> findByCustomerUserKeyOrderByRequestedAtDesc(String userKey);

    List<ServiceRequest> findByVendorIdOrderByRequestedAtDesc(Long vendorId);
}
