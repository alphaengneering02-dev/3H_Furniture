package com.cmyk.threeh.dto;

import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponseDTO {

@NotNull
private Long itemId;

@NotNull
private Long adminId;

private String category;
private String itemName;
private String itemDetail;
private String itemColor;
private int price;
private int discountPrice;
private String currency;
private int stock; 

}
//상품 조회시 DTO