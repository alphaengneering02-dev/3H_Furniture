package com.cmyk.threeh.enums;

import lombok.Getter;

@Getter
public enum PaymentState {
    
    PAID("결제완료"),
    CANCELLED("결제취소"),
    READY("결제 준비중");


    private final String message;

    PaymentState(String message){
        this.message = message;
    }
}
