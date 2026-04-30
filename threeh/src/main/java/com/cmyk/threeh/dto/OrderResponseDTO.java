package com.cmyk.threeh.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.enums.OrderType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderResponseDTO {
    
    private Long orderId;
    private String memberName;
    private String orderSate;
    private OrderType orderType;
    private LocalDateTime orderDate;
    private LocalDate deliveryDate;
    private LocalDate installDate;
    private String deliveryAddr;       
    private String deliveryAddrDetail;
    private String zipCode;
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
                .memberName(orders.getMember().getName()) 
                .orderSate(orders.getOrderState().getMessage())
                .orderType(orders.getOrderType())
                .orderDate(orders.getOrderDate())
                .deliveryDate(orders.getDeliveryDate())
                .deliveryAddr(orders.getDeliveryAddr())
                .deliveryAddrDetail(orders.getDeliveryAddrDetail())
                .installDate(orders.getInstallDate())
                //.zipCode(orders.getDelivery().getAddress().getzipcode())
                .orderitems(
                    orders.getOrderItems().stream()
                        .map(oi -> OrderItemDTO.builder()
                            .itemId(oi.getItem().getItemId())
                            .itemName(oi.getItem().getItemName())
                            .count(oi.getCount())
                            .orderPrice(oi.getOrderPrice())
                            .build()
                        )
                        .collect(java.util.stream.Collectors.toList())
                    )
                .build();
    }
}
