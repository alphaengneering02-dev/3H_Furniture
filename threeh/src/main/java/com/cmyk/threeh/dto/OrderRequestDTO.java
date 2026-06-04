package com.cmyk.threeh.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import com.cmyk.threeh.enums.OrderType;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor

public class OrderRequestDTO {
    private Long memberId;
    private Long deliveryId;
    private String memberName;
    private OrderType orderType;
    private LocalDateTime deliveryDate;
    private LocalDate installDate;
    private String deliveryAddr;
    private String deliveryAddrDetail;
    private String zipCode;
    private List<OrderItemDTO> orderItems;

    private LocalTime requestTime;
    private String requestMessage;

    //코드 추가_오현옥(장바구니 주문여부,주문완료 후 삭제할 장바구니 아이템 id목록)
    private boolean cartOrder;
    private boolean allCartOrder;
    private List<Long>cartItemIds;

    @Getter
    @NoArgsConstructor
    @Setter
    public static class OrderItemDTO {
        private Long itemId;
        private String itemName;
        private int count;
    }
}
