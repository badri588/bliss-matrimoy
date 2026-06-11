package com.allmatrimony.backend.repository;

import com.allmatrimony.backend.entity.ApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {
    List<ApprovalRequest> findAllByOrderBySubmittedAtDesc();
    Optional<ApprovalRequest> findTopByUserIdOrderBySubmittedAtDesc(Long userId);
    boolean existsByUserIdAndStatus(Long userId, String status);
}
