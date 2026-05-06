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
public class CartItemDTO {

    //장바구니 개별 아이템 고유 번호(화면에서 삭제 버튼 클릭 시 식별자로 사용)
    private Long cartitemId;
    
    //상품 고유 번호(상품 상세 페이지 이동이나 재고 확인 시 사용)
    private Long itemid;

    //소속된 장바구니 번호
    private Long cartid;

    //해당 상품의 장바구니 담긴 수량
    private Long count;
    
    /**
     * [구조적 특징]
     * 화면 구성이나 특정 비즈니스 로직 요구사항에 따라 
     * 상위 객체인 CartDTO 리스트를 포함할 수 있도록 유연하게 설계
     */
    private List<CartDTO> cartItems;

}