package com.cmyk.threeh.form;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemForm {

    //담으려는 상품의 고유 번호 - 필수값 체크
    @NotNull(message = "상품 번호가 전달되지 않았습니다")
    private Long itemId;

    //담으려는 수량 - 1개 미만으로 입력되는 비정상적인 요청 방지
    @Min(value = 1, message = "최소 1개 이상 담아야 합니다")
    @NotNull(message = "수량을 입력하세요")
    
    private Integer count;

}
