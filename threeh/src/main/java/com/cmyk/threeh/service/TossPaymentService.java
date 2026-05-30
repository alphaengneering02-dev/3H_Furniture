package com.cmyk.threeh.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;

import javax.transaction.Transactional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.Payment;
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
public class TossPaymentService{
    
    private final MemberService memberService;
    private final PaymentRepository paymentRepository;
    private final TossPaymentsConfig tossPaymentsConfig;

    public Payment requestPayment(Payment payment, String username){
        Member member = memberService.getUser(username); 

        if(payment.getAmount() < 1000){
            throw new CustomException(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        

        Long totalPrice = payment.getAmount();

        System.err.println(totalPrice);

        payment.setMember(member);

        return paymentRepository.save(payment);
    }


    public PaymentResponseDTO confirmPayment(String paymentKey, String orderId, Long amount){

        Payment payment = paymentRepository.findByOrderId(orderId)
        .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));


        return  payment.toPaymentResponseDTO();
    }

    @Transactional
    public PaymentSuccessDTO tossPaymentSuccess(String paymentKey, String orderId, Long amount){
        Payment payment = verifyPayment(orderId, amount);

           if (payment.isPaySuccessYN()) {
            return PaymentSuccessDTO.builder()
                .paymentKey(payment.getPaymentKey())
                .orderId(payment.getOrderId())
                .orderName(payment.getOrderName())
                .status("DONE") // 이미 완료된 상태
                .build();
            }

        PaymentSuccessDTO result = requestPaymentAccept(paymentKey, orderId, amount);
        payment.setPaymentKey(paymentKey);
        payment.setPaySuccessYN(true);
        return result;
    }

    public Payment verifyPayment(String orderId, Long amount){
        // Payment payment = paymentRepository.findByOrderId(orderId).orElseThrow(()-> {
        //     throw new CustomException(ErrorCode.PAYMENT_NOT_FOUND);
        // });
        Payment payment = paymentRepository.findByOrderId(orderId).orElseThrow(()->  //유소은_람다식(orElseThrow) 문법오류 수정
            new CustomException(ErrorCode.PAYMENT_NOT_FOUND)
        );

        if(!payment.getAmount().equals(amount)){
            throw new CustomException(ErrorCode.PAYMENT_AMOUNT_EXP);
        }

       

        return payment;
    }

    public PaymentSuccessDTO requestPaymentAccept(String paymentKey, String orderid, Long amount) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers =  getHeaders();
        JSONObject params = new JSONObject();
        params.put("paymentKey", paymentKey);
        params.put("orderId", orderid);
        params.put("amount", amount);

        PaymentSuccessDTO result = null;

        try {
            result = restTemplate.postForObject(TossPaymentsConfig.URL,

                new HttpEntity<>(params, headers),
                PaymentSuccessDTO.class
            );
        } catch (HttpClientErrorException e) {
            // 401 에러의 구체적인 본문을 로그로 확인 (원인 파악에 매우 유리)
            System.out.println("Toss API Error: " + e.getResponseBodyAsString());
            throw new RuntimeException("Toss API 인증 실패: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

        

        return result;
    }

    private HttpHeaders getHeaders() {

        HttpHeaders headers = new HttpHeaders();
        System.out.println("Secret Key: " + tossPaymentsConfig.getTestSecretKey());
        
        String secretKey = tossPaymentsConfig.getTestSecretKey() + ":";
        String encodedKey = Base64.getEncoder().encodeToString(secretKey.getBytes(StandardCharsets.UTF_8));
        
        System.out.println("Authorization: " + "Basic " + encodedKey);
        headers.set("Authorization", "Basic " + encodedKey);
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

    @Transactional
    public void tossPaymentFail(String code, String message, String orderId){
        // Payment payment = paymentRepository.findByOrderId(orderId).orElseThrow(()-> {
        //     throw new CustomException(ErrorCode.PAYMENT_NOT_FOUND);
        // });
        Payment payment = paymentRepository.findByOrderId(orderId).orElseThrow(()->  //유소은_람다식(orElseThrow) 문법오류 수정
            new CustomException(ErrorCode.PAYMENT_NOT_FOUND)
        );

        payment.setPaySuccessYN(false);
        payment.setFailReason(message);

    }


    
    public Slice<Payment> findAllChargingHistroies(String username, Pageable pageable){
        
        return paymentRepository.findAllByMember_Email(username, 

                PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    
                        Sort.Direction.DESC, "paymentId")
            
            
            
        );
        
    }


    

}
