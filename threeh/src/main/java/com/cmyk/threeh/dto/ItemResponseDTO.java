package com.cmyk.threeh.dto;

import javax.validation.constraints.NotNull;

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

private String category;
private String itemName;
private String itemDetail;
private String itemColor;
private Integer price;
private Integer discountPrice;
private String currency;
private Integer stock; 
private Integer finalPrice;


//상품 조회시 DTO

    public static ItemResponseDTO from(Item item){

        return ItemResponseDTO.builder()
        .itemId(item.getItemId())
        .adminId(item.getAdmin().getAdminId())
        .category(item.getCategory())
        .itemName(item.getItemName())
        .itemDetail(item.getItemDetail())
        .itemColor(item.getItemColor())
        .price(item.getPrice())
        .discountPrice(item.getDiscountPrice())
        .finalPrice(item.getFinalPrice())
        .currency(item.getCurrency())
        .stock(item.getStock())
        .build();
    }
}