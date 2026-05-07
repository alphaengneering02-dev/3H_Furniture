package com.cmyk.threeh;

import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.OrderItem;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;
import com.cmyk.threeh.enums.ItemSellStatus;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.repository.MemberRepository;
import com.cmyk.threeh.repository.OrderRepository;
import com.cmyk.threeh.service.AdminsService;
import com.cmyk.threeh.service.ItemService;
import com.cmyk.threeh.service.OrderService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.booleanThat;

import java.util.List;

import org.junit.jupiter.api.Test;

@SpringBootTest
@Transactional
public class ItemTest {
    
    @Autowired ItemService itemService;
    @Autowired ItemRepository itemRepository;
  
    @Autowired MemberRepository memberRepository;
    @Autowired OrderService orderService;
    @Autowired OrderRepository orderRepository;
    @Autowired AdminsRepository adminsRepository;
    @Autowired AdminsService adminsService;

    private Admins roleAdmin(){

        Admins admin = new Admins();

        admin.setAdLoginId("admin1");
        admin.setPassword("1234");
        admin.setAdminName("관리자");
        admin.setRole("ADMIN");

        return adminsRepository.save(admin);
    }
    
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void 상품등록테스트() throws Exception{

       //상품 생성

       Item item = new Item(); 

       item.setItemCategory("침실");
       item.setItemName("레스트침대");
       item.setItemDetail("편안함");
       item.setItemColor("ivory");
       item.setItemPrice(150000);
       item.setItemDiscountPrice(30000);
       item.setItemPriceCurrency("KRW");
       item.setItemStock(10);

       //저장
       Item savedItem = itemRepository.save(item);

       //검증
       assertEquals("레스트침대", savedItem.getItemName());
       assertEquals(150000,savedItem.getItemPrice());

       System.out.println("상품 등록 테스트 성공");

      // System.out.println(savedItem.getItemName()); 
      // System.out.println(savedItem.getItemPrice());

    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void 상품수정테스트(){

        //상품이름변경,가격변경,재고변경
        Item item = new Item();

        item.setItemCategory("침실");
        item.setItemName("침대");
        item.setItemPrice(100000);
        item.setItemDiscountPrice(0);
        item.setItemStock(10);

        Item savedItem = itemRepository.save(item);

        ItemUpdateRequestDTO dto = new ItemUpdateRequestDTO();

        dto.setItemName("수정된 침대");
        dto.setItemPrice(200000);
        dto.setItemDiscountPrice(2000);
        dto.setItemStock(4);

        assertEquals("수정된침대", savedItem.getItemName());
        assertEquals(200000, savedItem.getItemPrice());
        assertEquals(2000, savedItem.getItemDiscountPrice());
        assertEquals(4, savedItem.getItemStock());

        System.out.println("상품 수정 테스트 성공!!");

    }

    @Test
    public void 재고감소테스트(){

        Item item = new Item();

        item.setItemStock(10);

        item.removeStock(3);

        assertEquals(7, item.getItemStock());

        System.out.println("재고 감소 테스트 성공!!!");
        System.out.println(item.getItemStock());
    }

    @Test
    public void 재고부족테스트(){

        Item item = new Item();

        item.setItemStock(2);

        assertThrows(IllegalArgumentException.class,()-> item.removeStock(5));

        System.out.println("재고 부족 예외 테스트 성공!!!");

        System.out.println(item.getItemStock());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void 할인적용테스트(){

        Item item = new Item();

        item.setItemPrice(100000);

        item.setItemDiscountPrice(20000);

        assertEquals(20000, item.getItemDiscountPrice());

        System.out.println("할인 적용 테스트 성공!!");
        System.out.println(item.getItemDiscountPrice());
        System.out.println(item.getItemFinalPrice());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void 판매상태변경테스트(){

        Item item = new Item();

        item.changeSellStatus(ItemSellStatus.NotInStock);

        assertEquals(ItemSellStatus.NotInStock, item.getItemSellStatus());

        System.out.println("판매 상태 변경 테스트 성공!!");

        System.out.println(item.getItemSellStatus());

    }

    @Test
    public void 상품조회테스트(){

        Item item = new Item();

        item.setItemCategory("침실");
        item.setItemName("침대");
        item.setItemPrice(100000);
        item.setItemPriceCurrency("KRW");
        item.setItemStock(10);

        Item savedItem = itemRepository.save(item);

        Item findItem = itemRepository
        .findById(savedItem.getItemId())
        .orElseThrow(null);

        assertEquals("침대", findItem.getItemName());

        System.out.println("상품 조회 테스트 성공!!");
        System.out.println(findItem.getItemName());

    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void 상품삭제테스트(){

        Item item = new Item();

        item.setItemCategory("침실");
        item.setItemName("삭제상품");
        item.setItemPrice(10000);
        item.setItemPriceCurrency("KRW");
        item.setItemStock(1);

        Item savedItem = itemRepository.save(item);

        itemRepository.delete((savedItem));

        boolean exists = itemRepository
            .findById(savedItem.getItemId())
            .isPresent();

            assertEquals(false, exists);

            System.out.println("상품 삭제 테스트 성공!!!");

    }

    @Test
    public void 주문생성테스트(){

        //회원 생성
        Member member = new Member();
        member.setName("장미");
        member.setPassword("1234");

        Member savedMember = memberRepository.save(member);

        //상품 생성
        Item item = new Item();
        item.setItemName("침대");
        item.setItemPrice(1000000);
        item.setItemPriceCurrency("KRW");
        item.setItemStock(10);

        Item savedItem = itemRepository.save(item);

        //주문 생성
        Orders order = new Orders();
        order.setMember(savedMember);

        Orders savedOrders = orderRepository.save(order);

        //주문상품 생성

        OrderItem orderItem = OrderItem.creaOrderItem(savedItem, 100000, 2);

        orderItem.setOrders(savedOrders);

        //검증
        assertEquals(8, savedItem.getItemStock());

        assertEquals(200000, orderItem.getTotalPrice());

        System.out.println("주문 테스트 성공!");

    }

    @Test
    public void 주문취소테스트(){

        Item item = new Item();
        item.setItemName("침대");
        item.setItemPrice(100000);
        item.setItemStock(10);

        Item savedItem = itemRepository.save(item);

        OrderItem orderItem = OrderItem.creaOrderItem(savedItem, 100000, 2);

        //주문 후 재고 8
        assertEquals(8, savedItem.getItemStock());
        System.out.println(savedItem.getItemStock());
        //주문 취소
        orderItem.cancel();

        //다시 10 복구
        
        assertEquals(10, savedItem.getItemStock());
        System.out.println("주문취소 테스트 성공!!");
        System.out.println(savedItem.getItemStock());

    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void 상품서비스등록테스트(){

        //DTO생성

        ItemRequestDTO dto = new ItemRequestDTO();

        dto.setItemCategory("침실");
        dto.setItemName("호텔침대");
        dto.setItemDetail("푹신함");
        dto.setItemColor("White");
        dto.setItemPrice(300000);
        dto.setItemDiscountPrice(20000);
        dto.setItemPriceCurrency("KRW");
        dto.setItemStock(5);

        //서비스 실행
        ItemResponseDTO result = itemService.createItems(dto,"admin1");

        //검증
        assertEquals("호텔침대", result.getItemName());
        assertEquals(300000, result.getItemPrice());
        assertEquals(5, result.getItemStock());

        System.out.println(result.getItemName());
        System.out.println("상품 서비스 등록 테스트 성공!!");
    }


    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void 상품삭제서비스테스트(){

        Item item = new Item();

        item.setItemCategory("침실");
        item.setItemName("삭제상품");
        item.setItemPrice(10000);
        item.setItemPriceCurrency("KRW");
        item.setItemStock(3);

        Item savedItem = itemRepository.save(item);

        System.out.println(savedItem.getItemName());
        //삭제 실행
        itemService.deleteItem(savedItem.getItemId(), "admin1");

        // 검증
        boolean exists = itemRepository.findById(savedItem.getItemId()).isPresent();
    
        assertEquals(false, exists);

        System.out.println("상품 삭제 테스트 성공!!");

    }

    @Test
    public void 존재하지않는상품조회테스트(){

        assertThrows(CustomException.class, ()->{
            itemService.getItem(9L);
        });

        System.out.println("존재하지 않는 상품 조회 예외 테스트 성공!");
    }


    @Test
    public void 상품전체조회테스트(){

        Admins admin = new Admins();
        admin.setAdLoginId("admin");
        admin.setPassword("1234");
        admin.setAdminName("관리자");
        //admin.setRole(MemberRole.ADMIN);
        
        adminsRepository.save(admin);

        Item item1 = new Item();

        item1.setAdmin(admin);
        item1.setItemCategory("거실");
        item1.setItemName("소파");
        item1.setItemPrice(300000);
        item1.setItemPriceCurrency("KRW");
        item1.setItemStock(3);

        itemRepository.save(item1);

        Item item2 = new Item();
        
        item2.setAdmin(admin);
        item2.setItemCategory("침실");
        item2.setItemName("일룸침대");
        item2.setItemPrice(200000);
        item2.setItemPriceCurrency("KRW");
        item2.setItemStock(5);

        itemRepository.save(item2);

        List<ItemResponseDTO> items = itemService.getAllItems();

        assertEquals(7, items.size());

        System.out.println("상품 전체조회 테스트성공!!");

    }
    


}
