package com.cmyk.threeh.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentResponseDTO {
    

    private String payType;
    private Long amount;
    private String orderId;
    private String orderName;
    private String customerName;
    private String customerEamil;
    private String successUrl;
    private String failUrl;
    
    private String failReason;
    private boolean cancelYN;
    private String cancelReason;
    private String createdAt;
}
