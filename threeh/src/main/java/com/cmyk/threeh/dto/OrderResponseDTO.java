package com.cmyk.threeh.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.cmyk.threeh.domain.Orders;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderResponseDTO {
    
    private Long orderId;
    private String memberName;
    private String orderSate;
    private String orderType;
    private LocalDateTime orderDate;
    private LocalDate deliveryDate;
    private LocalDate installDate;
    private String deliveryAddr;        // ← 추가
    private String deliveryAddrDetail;
    private List<OrderItemDTO> orderitems;

    @Getter
    @Builder
    public static class OrderItemDTO {
        private Long itemId;
        private String itemName;
        private int count;
        private int orderPrice;
    }
    /*
    Entity -> DTO변환
    */
    public static OrderResponseDTO from (Orders orders){
        return OrderResponseDTO.builder()
                .orderId(orders.getOrderId())
                //.memberName(orders.getMember().getName()) 
                .orderSate(orders.getOrderState().getMessage())
                .orderType(orders.getOrderType())
                .orderDate(orders.getOrderDate())
                .deliveryDate(orders.getDeliveryDate())
                .deliveryAddr(orders.getDeliveryAddr())
                .deliveryAddrDetail(orders.getDeliveryAddrDetail())
                .installDate(orders.getInstallDate())
                .build();
    }
}
