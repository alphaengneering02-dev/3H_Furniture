package com.cmyk.threeh;

import static org.junit.jupiter.api.Assertions.assertEquals;

import javax.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.enums.ItemSellStatus;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.repository.MemberRepository;
import com.cmyk.threeh.repository.OrderRepository;
import com.cmyk.threeh.service.AdminsService;
import com.cmyk.threeh.service.ItemService;
import com.cmyk.threeh.service.MemberService;
import com.cmyk.threeh.service.OrderService;

@SpringBootTest
@Transactional
@Import(TestSecurityConfig.class)
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
    member.setId("user2");
    member.setPassword("1234");
    member.setEmail("test@naver.com");
    member.setPhone("01083691703");
    member.setRegNo("0202243074212");       // ← 추가
    member.setName("회원1");
    member.setRole(MemberRole.USER);    // ← 추가 (enum 값 확인해서 맞게)
    memberRepository.save(member);
    return member;
}
    @Autowired
    AdminsService adminsService;

    private Admins createAdmins(){
        AdminsDTO dto = new AdminsDTO();
        dto.setAdLoginId("admin1");
        dto.setPassword("123");
        dto.setAdminName("관리자");

        return adminsService.createAdmin(dto);
    }

    private Item createItem(String name, int price, int stock) {

        Admins admins = createAdmins();
    
        Item item = new Item();
        item.setItemDetail("이가구가 짱");
        item.setItemName(name);
        item.setPrice(price);
        item.setStock(stock);                          // ← 추가
        item.setCategory("가구");                      // ← 추가
        item.setCurrency("KRW");                       // ← 추가
        item.setItemSellStatus(ItemSellStatus.SELL);
        item.setAdmin(admins);
        // ← 추가
        itemRepository.save(item);
        return item;
}

}
