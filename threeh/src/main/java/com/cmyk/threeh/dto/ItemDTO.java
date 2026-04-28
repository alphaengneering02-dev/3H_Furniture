package com.cmyk.threeh.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemDTO {
    
    private Integer itemId;
    private Integer adminId;
    private String category;
    private String itemName;
    private String itemDetail;
    private String itemSellStatus;
    private String itemColor;
    private Integer price;
    private Integer discountPrice;
    private String currency;
    private Integer stock;

}
