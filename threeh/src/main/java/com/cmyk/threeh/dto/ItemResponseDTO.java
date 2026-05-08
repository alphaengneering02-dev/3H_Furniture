package com.cmyk.threeh.dto;

import com.cmyk.threeh.domain.Item;

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

private Long itemId;
private Long adminId;

private String itemCategory;
private String itemName;
private String itemDetail;
private String itemColor;
private Integer itemPrice;
private Integer itemDiscountPrice;
private String itemPriceCurrency;
private Integer itemStock; 
private Integer itemFinalPrice;


//상품 조회시 DTO

    public static ItemResponseDTO from(Item item){

        return ItemResponseDTO.builder()
        .itemId(item.getItemId())
        .itemCategory(item.getItemCategory())
        .itemName(item.getItemName())
        .itemDetail(item.getItemDetail())
        .itemColor(item.getItemColor())
        .itemPrice(item.getItemPrice())
        .itemDiscountPrice(item.getItemDiscountPrice())
        .itemFinalPrice(item.getItemFinalPrice())
        .itemPriceCurrency(item.getItemPriceCurrency())
        .itemStock(item.getItemStock())
        .build();
    }
}