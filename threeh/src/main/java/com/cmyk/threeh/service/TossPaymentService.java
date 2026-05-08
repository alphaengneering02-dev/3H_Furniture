package com.cmyk.threeh.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.Payment;
import com.cmyk.threeh.dto.PaymentDTO;
import com.cmyk.threeh.dto.PaymentResponseDTO;
import com.cmyk.threeh.dto.PaymentSuccessDTO;
import com.cmyk.threeh.global.config.TossPaymentsConfig;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.PaymentRepository;
import com.nimbusds.jose.shaded.json.JSONObject;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TossPaymentService {
    
    private final MemberService memberService;
    private final PaymentRepository paymentRepository;
    private final TossPaymentsConfig tossPaymentsConfig;

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

    @Transactional
    public PaymentSuccessDTO tossPaymentSuccess(String paymentKey, String orderId, Long amount){
        Payment payment = verifyPayment(orderId, amount);
        PaymentSuccessDTO result = requestPaymentAccept(paymentKey, orderId, amount);

        payment.setPaymentKey(paymentKey);
        payment.setPaySuccessYN(true);
        return result;
    }

    public Payment verifyPayment(String orderId, Long amount){
        Payment payment = paymentRepository.findByOrderId(orderId).orElseThrow(()-> {
            throw new CustomException(ErrorCode.PAYMENT_NOT_FOUND);
        });

        if(!payment.getAmount().equals(amount)){
            throw new CustomException(ErrorCode.PAYMENT_AMOUNT_EXP);
        }

        return payment;
    }

    public PaymentSuccessDTO requestPaymentAccept(String paymentKey, String orderid, Long amount) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers =  getHeaders();
        JSONObject params = new JSONObject();
        params.put("orderId", orderid);
        params.put("amount", amount);

        PaymentSuccessDTO result = null;

        try {
            result = restTemplate.postForObject(TossPaymentsConfig.URL + paymentKey,

                new HttpEntity<>(params, headers),
                PaymentSuccessDTO.class
            );
        } catch (Exception e) {
            throw new RuntimeException(e.toString());
        }

        return result;
    }

    private HttpHeaders getHeaders() {

        HttpHeaders headers = new HttpHeaders();

        String encodeAuthKey = new String(
            Base64.getEncoder().encode((tossPaymentsConfig.getTestSecretKey() + ":").getBytes(StandardCharsets.UTF_8)));
        
        headers.setBasicAuth(encodeAuthKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        return headers;
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
