package com.cmyk.threeh.repository;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cmyk.threeh.domain.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>{

    Optional<Payment> findByOrderId(String orderId);

    Optional<Payment> findByPaymentKeyAndMember_Email(String paymentKey, String email);

    Slice<Payment> findAllByMember_Email(String email, Pageable pageable);
    
}
