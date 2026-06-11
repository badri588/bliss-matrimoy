package com.allmatrimony.backend.repository;

import com.allmatrimony.backend.entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    Optional<EmailOtp> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, String purpose);
}
