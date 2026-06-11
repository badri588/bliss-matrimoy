package com.allmatrimony.backend.repository;

import com.allmatrimony.backend.entity.PremiumPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PremiumPaymentRepository extends JpaRepository<PremiumPayment, Long> {
    Optional<PremiumPayment> findByRazorpayOrderId(String razorpayOrderId);
}
