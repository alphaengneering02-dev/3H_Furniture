package com.cmyk.threeh.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.cmyk.threeh.enums.OrderType;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private String zipCode;
    private List<OrderItemDTO> orderitems;

    private LocalTime requesTime;
    private String requestMessage;

    @Getter
    @NoArgsConstructor
    @Setter
    public static class OrderItemDTO {
        private Long itemId;
        private int count;
    }
}
