package com.cmyk.threeh.enums;

public enum DeliveryStatus {

    //조장 수정

    ACCEPTED("수락"),
    WAITING("대기중"),   //대기중
    SHIPPING("배송중"),   //배송중
    COMPLETED("배송완료"),   //배송완료
    PICKUP("수거"),     //수거(교환 및 환불시)RETURNING
    REJECTED("거절");    //기사거절

    private final String message;

    DeliveryStatus(String message){
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
    
}