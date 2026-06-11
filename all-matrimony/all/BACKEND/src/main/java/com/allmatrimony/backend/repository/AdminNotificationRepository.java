package com.allmatrimony.backend.repository;

import com.allmatrimony.backend.entity.AdminNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    List<AdminNotification> findByAudienceAndUserIdOrderByCreatedAtDesc(String audience, Long userId);
    List<AdminNotification> findByAudienceOrderByCreatedAtDesc(String audience);
}
