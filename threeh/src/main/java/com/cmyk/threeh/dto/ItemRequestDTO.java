package com.cmyk.threeh.dto;

import javax.validation.constraints.NotBlank;
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
public class ItemRequestDTO {

//상품 생성시 (Request)

@NotBlank
private String itemCategory;

@NotBlank
private String itemName;

private String itemDetail;
private String itemColor;

@NotNull
private Integer itemPrice;

private Integer itemDiscountPrice;

private String itemPriceCurrency;

@NotNull
private Integer itemStock;


}

