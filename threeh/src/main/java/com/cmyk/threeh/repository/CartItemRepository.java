package com.cmyk.threeh.repository;


import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cmyk.threeh.domain.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long>{

    //중복 상품 확인 쿼리
    //특정 장바구니(cartId)에 특정상품(itemId) 이미 존재하는지 조회
    //엔티티의 연관 관계를 참조하는 쿼리 매소드 방식 사용
    CartItem findByCart_CartIdAndItem_ItemId(Long cartId, Long itemId);

    //아이템 단건 조회
    //장바구니 아이템의 고유 번호(PK)로 데이터를 조회하며, null 방지를 위합 옵셔널 사용
    Optional<CartItem> findByCartItemId(Long cartitemid);

    //장바구니 아이템 목록 조회
    List<CartItem> findByCart_CartId(Long cartId);

    //오현옥_코딩추가(장바구니 전체 비우기)
    void deleteByCart_CartId(Long cartId);

    //오현옥_코딩추가 선택된 cartItemId 여러 개 삭제(즉, 사용자가 선택한 상품만 주문할 때 삭제)
    void deleteByCartItemIdIn(List<Long> cartItemIds);
}
