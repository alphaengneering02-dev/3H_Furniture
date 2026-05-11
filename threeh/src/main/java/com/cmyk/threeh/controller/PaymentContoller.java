package com.cmyk.threeh.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.domain.Payment;
import com.cmyk.threeh.dto.PaymentDTO;
import com.cmyk.threeh.dto.PaymentFailDTO;
import com.cmyk.threeh.dto.PaymentResponseDTO;
import com.cmyk.threeh.global.config.TossPaymentsConfig;
import com.cmyk.threeh.service.TossPaymentService;

@RestController
@RequestMapping("/payment")
public class PaymentContoller {

    @Autowired TossPaymentService tossPaymentService;
    @Autowired TossPaymentsConfig tossPaymentsConfig;
    
    @PostMapping("/toss")
    public ResponseEntity requestTossPayment(@AuthenticationPrincipal User prinUser, @RequestBody PaymentDTO paymentDTO){
        PaymentResponseDTO payemntResDTO = tossPaymentService.requestPayment(paymentDTO.toEntity(), prinUser.getUsername()).toPaymentResponseDTO();

        paymentDTO.setYourSuccessUrl(paymentDTO.getYourSuccessUrl()== null ? tossPaymentsConfig.getSuccessUrl() : paymentDTO.getYourSuccessUrl());

        payemntResDTO.setFailUrl(paymentDTO.getYourFailUrl() == null ? tossPaymentsConfig.getFailUrl() : paymentDTO.getYourFailUrl());

        return ResponseEntity.ok().body(payemntResDTO);

    }

    @GetMapping("/toss/success")
    public ResponseEntity paymentSuccess(
        @RequestParam String paymentKey,
        @RequestParam String orderId,
        @RequestParam Long amount,
        @AuthenticationPrincipal User user){

           

            

            
            return ResponseEntity.ok().body(tossPaymentService.tossPaymentSuccess(paymentKey, orderId, amount));
        }
    

    @GetMapping("/payment/fail")
    public ResponseEntity paymentFail(
        @RequestParam String code, 
        @RequestParam String message,
        @RequestParam String orderId) {


            
            tossPaymentService.tossPaymentFail(code, message, orderId);


            return ResponseEntity.ok().body(
                PaymentFailDTO.builder()
                    .erroCode(code)
                    .erroMessage(message)
                    .orderId(orderId)
                    .build()
            );
        }
        
}
