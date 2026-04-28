package com.cmyk.threeh.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class PaymentRequestDTO {
    
    private Long orderId;
    private int paymentAmount;
    private String method;
}
