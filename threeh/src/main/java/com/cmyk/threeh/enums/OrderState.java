package com.cmyk.threeh.enums;

import lombok.Getter;


@Getter
public enum OrderState {

    ORDER("주문"),
    CANCEL("주문취소"),
    READY("배송 준비중"),
    EXCHANGEorREFUND("교환또는환불"),
    PURCHASED("구매확정");

    private final String message;

    OrderState(String message){
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

}
