package com.cmyk.threeh.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {

    //장바구니 식별 번호
    private Long cartId;   
    
    //장바구니 소유자 번호 (Member 엔티티 전체가 아닌 ID값만 전달하여 구성) 
    private Long memberId;  
    
    //장바구니에 담긴 상품 리스트(CartItemDTO로 변환된 목록)
    private List<CartItemDTO> cartItems;

}