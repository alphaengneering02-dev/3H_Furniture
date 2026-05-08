package com.cmyk.threeh.global.error;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    
    //회원
    MEMBER_NOT_FOUND(404, "회원을 찾을 수 없습니다."),
    MEMBER_FOUND(409, "이미 가입된 회원입니다."),
    EMAIL_IS_EXIST(409, "이미 가입된 이메일입니다."),
    PHONE_IS_EXIST(409, "이미 가입된 전화번호입니다."),
    REGNO_IS_EXIST(409, "이미 가입된 주민등록번호입니다."),
    INPUT_NOT_CORRECT(400, "입력한 값이 형식에 맞지 않습니다."),
    PASSWORD_NOT_SAME(401, "비밀번호가 일치하지 않습니다."),
    NOT_LOGIN(401, "로그인 상태가 아닙니다."),
    SOME_COLUMN_IS_NULL(404, "회원정보에 누락된 항목이 있습니다."),
    
    //북마크
    BOOKMARK_NOT_FOUND(404, "북마크가 존재하지 않습니다."),

    //주문
    ORDER_CANCEL_FAIL(400, "이미 배송완료 상품은 취소가 불가능합니다."),

    ORDER_NOT_FOUND(404, "주문을 찾을 수 없습니댜."),

    //결제
    INVALID_PAYMENT_AMOUNT(400, "결제 금액이 너무 적습니다."),
    PAYMENT_NOT_FOUND(404, "결제 정보를 불러오는데 실패했습니다."),
    PAYMENT_AMOUNT_EXP(400, "결제 금액이 맞지 않습니다."),

    //상품 찾기
    ITEM_NOT_FOUND(404,"상품을 찾을 수 없습니다."),

    //이미지
    ITEMIMG_NOT_FOUND(404,"상품 이미지가 없습니다."),

    //권한없음
    NO_PERMISSION(404,"관리자 권한이 없습니다."),

    //관리자 찾을 수 없음
    ADMIN_NOT_FOUND(404,"존재하지 않는 관리자 입니다.");

    private final int status;
    private final String message;
}
