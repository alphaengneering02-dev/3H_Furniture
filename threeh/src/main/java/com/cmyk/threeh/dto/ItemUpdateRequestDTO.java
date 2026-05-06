package com.cmyk.threeh.dto;

import javax.validation.constraints.NotBlank;

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
    //상품 수정할 때 수정이 가능한 값만 다루는 DTO

    private String category;

    private String itemName;

    private String adLoginId;

    private String itemDetail;
    private String itemColor;
    
    private Integer price;
    private Integer discountPrice;
    private Integer stock;

}


