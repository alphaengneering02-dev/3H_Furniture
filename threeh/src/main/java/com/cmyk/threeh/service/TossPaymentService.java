package com.cmyk.threeh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.Payment;
import com.cmyk.threeh.dto.PaymentResponseDTO;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TossPaymentService {
    
    private final MemberService memberService;
    private final PaymentRepository paymentRepository;

    public Payment requestPayment(Payment payment, String userEmail){
        Member member = memberService.findMember(userEmail); 

        if(payment.getAmount() < 1000){
            throw new CustomException(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        payment.setMember(member);

        return paymentRepository.save(payment);
    }


    public PaymentResponseDTO confirmPayment(String paymentKey, String orderId, Long amount){

        Payment payment = paymentRepository.findByOrderId(orderId)
        .orElseThrow(() -> new CustomException(ErrorCode.BOOKMARK_NOT_FOUND));


        return  payment.toPaymentResponseDTO();
    }

    /**
     * 
     * public void failPayment(String code, String message, String orderId){
     * }
     */

    /**
     * 결제 취소 로직
     */
}
