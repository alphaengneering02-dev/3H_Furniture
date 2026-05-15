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
    private Long cartItemId;
    
    //상품 고유 번호(상품 상세 페이지 이동이나 재고 확인 시 사용)
    private Long itemId;

    //소속된 장바구니 번호
    private Long cartId;

    //해당 상품의 장바구니 담긴 수량
    private Long count;

    //URL 이미지 파일
    private String imageUrl;

    //[추가] 리액트 화면 루프 및 조장님 오더 연동을 위한 상품명
    private String itemName;

    //[추가] 리액트 가격 연산 및 조장님 오더 연동을 위한 단가 가격
    private Long orderPrice;
    
    /**
     * [구조적 특징]
     * 화면 구성이나 특정 비즈니스 로직 요구사항에 따라 
     * 상위 객체인 CartDTO 리스트를 포함할 수 있도록 유연하게 설계
     */
    private List<CartDTO> cartItems;

}
