package com.cmyk.threeh.service;


import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.OrderItem;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.repository.MemberRepository;
import com.cmyk.threeh.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final ItemRepository itemRepository;

    /*
    주문 저장
        @param memberId, itemId, count
        @return Long
     */

    @Transactional
    public Long order(Long memberId, Long itemId, int count){

        //엔티티 조회
        Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

        Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new CustomException(ErrorCode.ITEM_NOT_FOUND));

        //주문 정보 생성
        Orders order = new Orders();
        Delivery delivery = new Delivery();


        order.setDeliveryAddr(order.getDeliveryAddr());
        order.setDeliveryAddrDetail(order.getDeliveryAddr());

        OrderItem orderItem = OrderItem.creaOrderItem(item, item.getPrice(), count);

        order = Orders.createOrder(member, delivery, orderItem);

        orderRepository.save(order);

        return order.getOrderId();

    }

    @Transactional
    public void cancelOrder(Long orderId){

        Orders orders = orderRepository.findById(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));


        orders.cancel();
    }

}
