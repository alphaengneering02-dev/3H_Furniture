package com.cmyk.threeh.form;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemForm {

    @NotNull(message = "상품 번호가 전달되지 않았습니다")
    private Long itemId;

    @Min(value = 1, message = "최소 1개 이상 담아야 합니다")
    @NotNull(message = "수량을 입력하세요")
    
    private Integer count;

}
