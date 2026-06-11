package com.allmatrimony.backend.repository;

import com.allmatrimony.backend.entity.InterestRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterestRequestRepository extends JpaRepository<InterestRequest, Long> {
    List<InterestRequest> findBySenderUserIdOrReceiverUserIdOrderByCreatedAtDesc(Long senderUserId, Long receiverUserId);
    Optional<InterestRequest> findTopBySenderUserIdAndReceiverUserIdOrderByCreatedAtDesc(Long senderUserId, Long receiverUserId);
    Optional<InterestRequest> findTopBySenderUserIdAndReceiverUserIdOrSenderUserIdAndReceiverUserIdOrderByCreatedAtDesc(
            Long senderUserId,
            Long receiverUserId,
            Long reverseSenderUserId,
            Long reverseReceiverUserId
    );
    boolean existsBySenderUserIdAndReceiverUserIdAndStatus(Long senderUserId, Long receiverUserId, String status);
}
