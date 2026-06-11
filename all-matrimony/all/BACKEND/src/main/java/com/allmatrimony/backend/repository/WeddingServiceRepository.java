package com.allmatrimony.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.allmatrimony.backend.entity.WeddingService;

import java.util.List;

public interface WeddingServiceRepository extends JpaRepository<WeddingService, String> {
    List<WeddingService> findByVendorId(Long vendorId);
}
