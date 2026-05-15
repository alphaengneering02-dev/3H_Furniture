package com.cmyk.threeh.repository;




import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cmyk.threeh.domain.OrderItem;
import com.cmyk.threeh.domain.Orders;



@Repository
public interface OrderRepository extends JpaRepository<Orders, Long>{

    List<Orders> findByMemberId(String memberId);

    List<OrderItem> findByOrderItems(String orderId);
   

    //태양 딜리버리 주문 목록 조회 
    List<Orders> findByDelivery_DeliveryId(Long deliveryId);
}
