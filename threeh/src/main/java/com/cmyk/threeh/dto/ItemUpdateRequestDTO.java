package com.cmyk.threeh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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
