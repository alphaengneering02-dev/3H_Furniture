package com.cmyk.threeh.dto;

import java.time.LocalDate;
import java.util.List;

import com.cmyk.threeh.enums.OrderType;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OrderRequestDTO {
    private Long memberId;
    private Long deliveryId;
    private OrderType orderType;
    private LocalDate deliveryDate;
    private LocalDate installDate;
    private String deliveryAddr;
    private String deliveryAddrDetail;
    private List<OrderItemDTO> orderitems;

    @Getter
    @NoArgsConstructor
    public static class OrderItemDTO {
        private Long itemId;
        private int count;
    }
}
