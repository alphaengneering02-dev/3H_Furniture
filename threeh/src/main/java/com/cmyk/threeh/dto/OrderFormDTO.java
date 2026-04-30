package com.cmyk.threeh.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderFormDTO {
    private Long itemId;
    private String itemName;
    private String itmeDetail;
    private int price;
    private int stock;
    private String memberName;
    private String email;
    private String phone;
    private String defaultAddr;
    private String defualtAddrDetail;
    private String defaultZipCode;
}
