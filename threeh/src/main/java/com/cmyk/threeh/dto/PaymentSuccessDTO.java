package com.cmyk.threeh.dto;

import lombok.Data;

@Data
public class PaymentSuccessDTO {
    String mid; // 토스 아이디
    String version;
    String paymentKey;
    String orderId;
    String orderName;
    String currency;
    String method;
    String totalAmount;
    String balaceAmount;
    String suppliedAmount;
    String vat;
    String status;
    String requestedAt;
    String useEscrow;
    String cultureExpense;
    PaymentSuccessDTO card;
    String type;
}
