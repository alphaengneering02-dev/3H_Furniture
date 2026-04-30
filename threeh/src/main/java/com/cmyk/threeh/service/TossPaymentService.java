package com.cmyk.threeh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.Payment;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.PaymentRepository;

import lombok.NoArgsConstructor;

@Service
@NoArgsConstructor
public class TossPaymentService {
    
   @Autowired 
   MemberService memberService;
   @Autowired
   PaymentRepository paymentRepository;

    public Payment requestPayment(Payment payment, String userEmail){
        Member member = memberService.findMember(userEmail); 

        if(payment.getAmount() < 1000){
            throw new CustomException(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        payment.setMember(member);

        return paymentRepository.save(payment);
    }
}
