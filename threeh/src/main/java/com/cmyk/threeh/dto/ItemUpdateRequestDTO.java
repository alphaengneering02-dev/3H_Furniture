package com.cmyk.threeh.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ItemUpdateRequestDTO {

    private String category;
    private String itemName;
    private String itemDetail;
    private String itemColor;
    private int price;
    private int discountPrice;
    private int stock;

}

//상품 수정할 때 수정이 가능한 값만 다루는 DTO
