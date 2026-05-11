package com.cmyk.threeh.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Getter
@Builder
public class OrderFormDTO {
    private List<OrderItemInfo> items;
    private Long itemId;
    private String itemName;
    private String itemDetail;
    private int price;
    private int stock;
    private String itemIamge;
    private String memberName;
    private String email;
    private String phone;
    private String defaultAddr;
    private String defaultAddrDetail;
    private String defaultZipCode;
    private String isDefault;


     @Data
    @Builder
    public static class OrderItemInfo {  // 추가
        private Long itemId;
        private String itemName;
        private String itemDetail;
        private Integer price;
        private int count;
        private String itemImage;
    }
}
