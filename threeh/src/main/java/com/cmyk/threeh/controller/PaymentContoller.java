package com.cmyk.threeh.controller;


import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
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
import com.cmyk.threeh.dto.ChargingHistoryDTO;
import com.cmyk.threeh.dto.PaymentDTO;
import com.cmyk.threeh.dto.PaymentFailDTO;
import com.cmyk.threeh.dto.PaymentResponseDTO;
import com.cmyk.threeh.dto.SliceInfo;
import com.cmyk.threeh.dto.SliceResponseDTO;
import com.cmyk.threeh.global.config.TossPaymentsConfig;
import com.cmyk.threeh.service.PaymentMapper;
import com.cmyk.threeh.service.TossPaymentService;

@RestController
@RequestMapping("/payment")
public class PaymentContoller {

    @Autowired TossPaymentService tossPaymentService;
    @Autowired TossPaymentsConfig tossPaymentsConfig;
    @Autowired  PaymentMapper mapper;
    
    @PostMapping("/toss")
    public ResponseEntity requestTossPayment(Principal principal, @RequestBody PaymentDTO paymentDTO){
        System.out.print("로그인 유저: "  + principal.getName());
        PaymentResponseDTO payemntResDTO = tossPaymentService.requestPayment(paymentDTO.toEntity(), principal.getName()).toPaymentResponseDTO();

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

    @GetMapping("/history")
    public ResponseEntity getChargingHistory(Principal principal, Pageable pageable) {

        Slice<Payment> chargingHistories = tossPaymentService.findAllChargingHistroies(principal.getName(), pageable);

        List<ChargingHistoryDTO> content = mapper.chargingHistoryToChargingHistoryResponse(chargingHistories.getContent());

        SliceInfo sliceInfo = new SliceInfo(pageable, chargingHistories.getNumberOfElements(), chargingHistories.hasNext());

        return new ResponseEntity<>(
             new SliceResponseDTO<>(content, sliceInfo), HttpStatus.OK
        );
    }

    
        
}
