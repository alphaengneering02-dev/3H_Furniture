package com.cmyk.threeh.service;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Payment;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class tossPaymentFail {

    
    @Autowired private final PaymentRepository paymentRepository;

    @Transactional
    public void tossPaymentFail(String code, String message, String orderId){
        Payment payment = paymentRepository.findByOrderId(orderId).orElseThrow(() ->{
            throw new CustomException(ErrorCode.PAYMENT_NOT_FOUND);
        });

        payment.setPaySuccessYN(false);
        payment.setFailReason(message);
    }
    
}
