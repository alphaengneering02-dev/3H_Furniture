package com.cmyk.threeh.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PaymentResponseDTO {
    

    private boolean success;
    private String transactionId;
    private String impUid; // 가상계좌일 경우
    private String bankName;
    private LocalDateTime expiredAt;
}
