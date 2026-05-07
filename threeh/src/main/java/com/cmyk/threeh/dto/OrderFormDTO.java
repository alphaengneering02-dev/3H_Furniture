package com.cmyk.threeh.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderFormDTO {
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
}
