package com.cmyk.threeh.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.cmyk.threeh.dto.PaymentDTO;
import com.cmyk.threeh.dto.PaymentResponseDTO;
import com.cmyk.threeh.global.config.TossPaymentsConfig;
import com.cmyk.threeh.service.TossPaymentService;

@Controller
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

    // @GetMapping("/payment/success")
    // public ResponseEntity paymentSuccess(
    //     @RequestParam String paymentKey,
    //     @RequestParam String orderId,
    //     @RequestParam Long amount,
    //     @AuthenticationPrincipal User user){

    //         PaymentResponseDTO responseDTO = tossPaymentService.confirmPayment(paymentKey, orderId, amount, user.getUsername());
            
    //         return ResponseEntity.ok().body(responseDTO);
    //     }
    

    // @GetMapping("/paymet/fail")
    // public ResponseEntity paymentFail(
    //     @RequestParam String code, 
    //     @RequestParam String message,
    //     @RequestParam String orderId) {


            
    //         tossPaymentService.failPayment(code, message, orderId);


    //         return ResponseEntity.ok().body(message);
    //     }
        
}
