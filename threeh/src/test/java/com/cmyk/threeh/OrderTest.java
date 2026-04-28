package com.cmyk.threeh;

import static org.junit.jupiter.api.Assertions.assertEquals;

import javax.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.repository.MemberRepository;
import com.cmyk.threeh.repository.OrderRepository;
import com.cmyk.threeh.service.ItemService;
import com.cmyk.threeh.service.MemberService;
import com.cmyk.threeh.service.OrderService;

@SpringBootTest
@Transactional
public class OrderTest {
    
    @Autowired OrderService orderService;
    @Autowired OrderRepository orderRepository;
    @Autowired MemberRepository memberRepository;
    @Autowired ItemRepository itemRepository;

    @Autowired
    MemberService memberService;
    @Autowired
    ItemService itemService;
    @Test
    public void 상품주문() throws Exception {
        // given (준비)
        Member member = createMember();
        Item item = createItem("JPA 책", 10000, 10);
        int orderCount = 2;

        // when (실행)
        Long orderId = orderService.order(member.getMemberId(), item.getItemId(), orderCount);

        // then (검증)
        Orders getOrder = orderRepository.findById(orderId).get();

        assertEquals(OrderState.ORDER, getOrder.getOrderState(), "주문 시 상태는 ORDER여야 한다");
        assertEquals(1, getOrder.getOrderItems().size(), "주문한 상품 종류 수가 정확해야 한다");
        assertEquals(10000 * orderCount, getOrder.getTotalPrice(), "주문 가격은 가격 * 수량이다");
        // item의 재고가 줄었는지도 확인 필요 (Item 엔티티에 로직이 있다면)
        // assertEquals(8, item.getStockQuantity(), "주문 후 재고가 줄어야 한다");
    }

    private Member createMember() {
        Member member = new Member();
        member.setId("user1");
        member.setName("회원1");
        memberRepository.save(member);
        return member;
    }

    private Item createItem(String name, int price, int stock) {
        Item item = new Item();
        item.setItemName(name);
        item.setPrice(price);
        // item.setStockQuantity(stock); // 재고 필드가 있다면
        itemRepository.save(item);
        return item;
    }

}
