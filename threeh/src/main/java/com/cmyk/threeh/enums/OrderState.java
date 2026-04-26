package com.cmyk.threeh.enums;

import lombok.Getter;

@Getter
public enum OrderState {

    ORDER("주문"),
    CANCEL("주문취소"),
    PAYMENTED("결제완료"),
    READY("배송 준비중"),
    DELIVERYING("배송중"),
    DELIVERED("배송완료"),
    INSTALLED("설치완료"),
    PURCHASED("구매완료");

    private final String message;

    OrderState(String message){
        this.message = message;
    }

}
