package com.allmatrimony.backend.repository;

import com.allmatrimony.backend.entity.VerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, Long> {
    List<VerificationRequest> findAllByOrderBySubmittedAtDesc();
    List<VerificationRequest> findByUserIdOrderBySubmittedAtDesc(Long userId);
    Optional<VerificationRequest> findTopByUserIdOrderBySubmittedAtDesc(Long userId);
    boolean existsByUserIdAndStatus(Long userId, String status);
}
