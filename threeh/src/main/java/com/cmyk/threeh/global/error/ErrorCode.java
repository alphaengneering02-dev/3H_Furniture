package com.cmyk.threeh.global.error;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    
    //회원
    MEMBER_NOT_FOUND(404, "회원을 찾을 수 없습니다."),

    //주문
    ORDER_CANCEL_FAIL(400, "이미 배송완료 상품은 취소가 불가능합니다.");

    private final int status;
    private final String message;
}
