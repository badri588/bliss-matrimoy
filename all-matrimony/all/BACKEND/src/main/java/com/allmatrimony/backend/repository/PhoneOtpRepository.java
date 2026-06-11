package com.allmatrimony.backend.repository;

import com.allmatrimony.backend.entity.PhoneOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PhoneOtpRepository extends JpaRepository<PhoneOtp, Long> {

    Optional<PhoneOtp> findTopByPhoneOrderByCreatedAtDesc(String phone);
}
