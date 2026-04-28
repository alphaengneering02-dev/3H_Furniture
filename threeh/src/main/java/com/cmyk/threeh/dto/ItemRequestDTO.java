package com.cmyk.threeh.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemRequestDTO {

private long adminId;
private String category;
private String itemName;
private String itemDetail;
private String itemColor;
private int price;
private int discountPrice;
private String currency;
private int stock;

}

//상품 등록시 (Request)