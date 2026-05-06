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
private String category;

@NotBlank
private String itemName;

private String itemDetail;
private String itemColor;

@NotNull
private Integer price;

private Integer discountPrice;

private String currency;

@NotNull
private Integer stock;

}

