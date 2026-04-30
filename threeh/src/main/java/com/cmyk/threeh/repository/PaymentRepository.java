package com.cmyk.threeh.repository;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long>{

    Optional<Payment> findByOrderId(String orderId);

    Optional<Payment> findByPaymentKeyAndMember_Email(String paymentKey, String email);

    Slice<Payment> findAllByMember_Email(String email, Pageable pageable);
    
}
