package com.cmyk.threeh.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.cmyk.threeh.domain.Adress;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.enums.OrderType;
import com.nimbusds.openid.connect.sdk.claims.Address;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderResponseDTO {
    
    private Long orderId;
    private Long deliveryId;
    private String memberName;
    private String orderState;
    private OrderType orderType;
    private LocalDateTime orderDate;
    private LocalDate deliveryDate;
    private LocalDate installDate;
    private String deliveryAddr;       
    private String deliveryAddrDetail;
    private String zipCode;
    private List<OrderItemDTO> orderitems;

    //태양 order에 delivery_status 필요
    private String deliveryStatus;
    //태양 전화번호 email 필요
    private Long memberId;

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
                .memberId(orders.getMember() != null ? orders.getMember().getMemberId() : null)
                .deliveryId(
                orders.getDelivery() != null
                    ? orders.getDelivery().getDeliveryId() : null)
                .memberName(orders.getMember().getName()) 
                .orderState(orders.getOrderState().getMessage())
                //태양 order에 delivery_status 필요
                .deliveryStatus(orders.getDeliveryStatus() != null ? orders.getDeliveryStatus().name() : null)
                .orderType(orders.getOrderType())
                .orderDate(orders.getOrderDate())
                .deliveryDate(orders.getDeliveryDate())
                .deliveryAddr(orders.getDeliveryAddr())
                .deliveryAddrDetail(orders.getDeliveryAddrDetail())
                .installDate(orders.getInstallDate())
                
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
