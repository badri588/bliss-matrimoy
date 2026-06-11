package com.allmatrimony.backend.repository;

import com.allmatrimony.backend.entity.ServiceBookingPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ServiceBookingPaymentRepository extends JpaRepository<ServiceBookingPayment, Long> {
    Optional<ServiceBookingPayment> findByRazorpayOrderId(String razorpayOrderId);
}
