package com.cmyk.threeh.dto;

import java.util.UUID;

import com.cmyk.threeh.domain.Payment;
import com.cmyk.threeh.enums.PayType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor

/**
 * 결제 요청 DTO
 */
public class PaymentDTO {
    @NonNull
    private PayType payType; //결제타입
    @NonNull
    private Long amount; //가격정보
    @NonNull
    private String orderName;

    private String yourSuccessUrl;
    private String yourFailUrl;

    public Payment toEntity(){
        return Payment.builder()
            .payType(payType)
            .amount(amount)
            .orderName(orderName)
            .orderId(UUID.randomUUID().toString())
            .paySuccessYN(false)
            .build();      
    }
}
