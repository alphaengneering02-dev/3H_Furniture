package com.cmyk.threeh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cmyk.threeh.domain.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem,Long> {

    //해당 회원이 해당 상품을 구매한 적이 있는지 확인
    //CANCEL 상태가 아닌 주문이면 구매한 것으로 인정

    @Query(
        "SELECT COUNT(oi) > 0 " +
        "FROM OrderItem oi " +
        "WHERE oi.orders.member.memberId = :memberId " +
        "AND oi.item.itemId = :itemId " +
        "AND oi.orders.orderState <> com.cmyk.threeh.enums.OrderState.CANCEL"
    )
    boolean existsPurchasedItem(
        @Param("memberId")Long memberId,
        @Param("itemId")Long itemId
    );
    
}
