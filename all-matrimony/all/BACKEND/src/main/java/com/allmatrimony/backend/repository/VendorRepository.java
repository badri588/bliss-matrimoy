package com.allmatrimony.backend.repository;

import com.allmatrimony.backend.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<Vendor> findByEmail(String email);
    Optional<Vendor> findByPhone(String phone);
    List<Vendor> findByApprovalStatusOrderByKycSubmittedAtDesc(String approvalStatus);
    List<Vendor> findAllByOrderByCreatedAtDesc();
}
