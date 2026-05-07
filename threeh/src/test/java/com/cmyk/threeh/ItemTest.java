package com.cmyk.threeh;

import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

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

    
    @Test
      /* public void 상품등록테스트() throws Exception{

       //상품 생성

       Item item = new Item(); 

       item.setCategory("침실");
       item.setItemName("레스트침대");
       item.setItemDetail("편안함");
       item.setItemColor("ivory");
       item.setPrice(150000);
       item.setDiscountPrice(30000);
       item.setCurrency("KRW");
       item.setStock(10);

       //저장
       Item savedItem = itemRepository.save(item);

       //검증
       assertEquals("레스트침대", savedItem.getItemName());
       assertEquals(150000,savedItem.getPrice());

       System.out.println("상품 등록 테스트 성공");

      // System.out.println(savedItem.getItemName()); 
      // System.out.println(savedItem.getPrice());

    }
   */  

    /* 
    public void 상품수정테스트(){

        //상품이름변경,가격변경,재고변경
        Item item = new Item();

        item.setCategory("침실");
        item.setItemName("침대");
        item.setPrice(100000);
        item.setCurrency("KRW");
        item.setStock(10);

        Item savedItem = itemRepository.save(item);

        savedItem.updateItem("침실", "수정된침대", "푹신함", "white", 200000, 2000, "KRW", 4);

        assertEquals("수정된침대", savedItem.getItemName());
        assertEquals(200000, savedItem.getPrice());
        assertEquals(4, savedItem.getStock());

        System.out.println("상품 수정 테스트 성공!!");

    }
    */

    /* 
    public void 재고감소테스트(){

        Item item = new Item();

        item.setStock(10);

        item.removeStock(3);

        assertEquals(7, item.getStock());

        System.out.println("재고 감소 테스트 성공!!!");
        System.out.println(item.getStock());
    }
    */

    /* 
    public void 재고부족테스트(){

        Item item = new Item();

        item.setStock(2);

        assertThrows(IllegalArgumentException.class,()-> item.removeStock(5));

        System.out.println("재고 부족 예외 테스트 성공!!!");

        System.out.println(item.getStock());
    }
    */

    /* 
    public void 할인적용테스트(){

        Item item = new Item();

        item.setPrice(100000);

        item.applyDiscount(20000);

        assertEquals(20000, item.getDiscountPrice());

        System.out.println("할인 적용 테스트 성공!!");
        System.out.println(item.getDiscountPrice());
        System.out.println(item.getPrice());
    }
    */

    /*
    public void 판매상태변경테스트(){

        Item item = new Item();

        item.changeSellStatus(ItemSellStatus.NotInStock);

        assertEquals(ItemSellStatus.NotInStock, item.getItemSellStatus());

        System.out.println("판매 상태 변경 테스트 성공!!");

        System.out.println(item.getItemSellStatus());

    }
    */

    /* 
    public void 상품조회테스트(){

        Item item = new Item();

        item.setCategory("침실");
        item.setItemName("침대");
        item.setPrice(100000);
        item.setCurrency("KRW");
        item.setStock(10);

        Item savedItem = itemRepository.save(item);

        Item findItem = itemRepository
        .findById(savedItem.getItemId())
        .orElseThrow(null);

        assertEquals("침대", findItem.getItemName());

        System.out.println("상품 조회 테스트 성공!!");
        System.out.println(findItem.getItemName());

    }
    */

    /*
    public void 상품삭제테스트(){

        Item item = new Item();

        item.setCategory("침실");
        item.setItemName("삭제상품");
        item.setPrice(10000);
        item.setCurrency("KRW");
        item.setStock(1);

        Item savedItem = itemRepository.save(item);

        itemRepository.delete((savedItem));

        boolean exists = itemRepository
            .findById(savedItem.getItemId())
            .isPresent();

            assertEquals(false, exists);

            System.out.println("상품 삭제 테스트 성공!!!");

    }
     */

    /* 
    public void 가격음수예외테스트(){

        Item item = new Item();

        assertThrows(IllegalArgumentException.class,()-> item.updateItem("침실", "침대", "설명", "white", -1000, 0, "KRW", 10)
        
    );
        System.out.println("가격 음수 예외 테스트 성공!!!!!!!");
        System.out.println(item.getPrice());

    }
    */

    /* 
    public void 재고음수예외테스트(){

        Item item = new Item();

        assertThrows(IllegalArgumentException.class,()->item.updateItem("침실", "침대", "설명", "white", 10000, 0, "KRW", -1)
        );
        System.out.println(item.getStock());
        System.out.println("재고 음수 예외 테스트 성공!!");

    }
    */

    /* 
    public void 주문생성테스트(){

        //회원 생성
        Member member = new Member();
        member.setName("장미");
        member.setPassword("1234");

        Member savedMember = memberRepository.save(member);

        //상품 생성
        Item item = new Item();
        item.setItemName("침대");
        item.setPrice(1000000);
        item.setCurrency("KRW");
        item.setStock(10);

        Item savedItem = itemRepository.save(item);

        //주문 생성
        Orders order = new Orders();
        order.setMember(savedMember);

        Orders savedOrders = orderRepository.save(order);

        //주문상품 생성

        OrderItem orderItem = OrderItem.creaOrderItem(savedItem, 100000, 2);

        orderItem.setOrders(savedOrders);

        //검증
        assertEquals(8, savedItem.getStock());

        assertEquals(200000, orderItem.getTotalPrice());

        System.out.println("주문 테스트 성공!");

    }
    */

    /* 
    public void 주문취소테스트(){

        Item item = new Item();
        item.setItemName("침대");
        item.setPrice(100000);
        item.setStock(10);

        Item savedItem = itemRepository.save(item);

        OrderItem orderItem = OrderItem.creaOrderItem(savedItem, 100000, 2);

        //주문 후 재고 8
        assertEquals(8, savedItem.getStock());
        System.out.println(savedItem.getStock());
        //주문 취소
        orderItem.cancel();

        //다시 10 복구
        
        assertEquals(10, savedItem.getStock());
        System.out.println("주문취소 테스트 성공!!");
        System.out.println(savedItem.getStock());

    }
    */


    /* 
    public void 재고부족테스트(){

        Item item = new Item();

        item.setItemName("의자");
        item.setPrice(50000);
        item.setCurrency("KRW");
        item.setStock(2);

        Item savedItem = itemRepository.save(item);

        assertThrows(IllegalArgumentException.class, ()->{OrderItem.creaOrderItem(savedItem, 50000, 5);

        });

        System.out.println(savedItem.getItemSellStatus());
        System.out.println("재고 부족 주문 테스트 성공!!");
    }
    */

    /* 
    public void 상품서비스등록테스트(){

        //DTO생성

        ItemRequestDTO dto = new ItemRequestDTO();

        dto.setCategory("침실");
        dto.setItemName("호텔침대");
        dto.setItemDetail("푹신함");
        dto.setItemColor("White");
        dto.setPrice(300000);
        dto.setDiscountPrice(20000);
        dto.setCurrency("KRW");
        dto.setStock(5);

        //서비스 실행
        ItemResponseDTO result = itemService.createItems(dto);

        //검증
        assertEquals("호텔침대", result.getItemName());
        assertEquals(300000, result.getPrice());
        assertEquals(5, result.getStock());

        System.out.println(result.getItemName());
        System.out.println("상품 서비스 등록 테스트 성공!!");
    }
    */

    /* 
    public void 상품서비스수정테스트(){

        Item item = new Item();

        item.setCategory("침실");
        item.setItemName("기존침대");
        item.setPrice(100000);
        item.setCurrency("KRW");
        item.setStock(10);

        Item savedItem = itemRepository.save(item);

        System.out.println(item.getItemDetail());

        //수정DTO
        ItemUpdateRequestDTO dto = new ItemUpdateRequestDTO();

        dto.setItemName("수정침대");
        dto.setItemDetail("푹신함");
        dto.setPrice(200000);
        dto.setStock(5);

        //서비스 실행
        ItemResponseDTO result = itemService.updateItem(savedItem.getItemId(), dto);
        
        System.out.println(item.getItemDetail());

        //검증
        assertEquals("수정침대", result.getItemName());
        assertEquals(200000, result.getPrice());
        assertEquals(5, result.getStock());

        System.out.println("상품 수정 서비스 테스트 성공!");
    }
    */

    /*
    public void 상품삭제서비스테스트(){

        Item item = new Item();

        item.setCategory("침실");
        item.setItemName("삭제상품");
        item.setPrice(10000);
        item.setCurrency("KRW");
        item.setStock(3);

        Item savedItem = itemRepository.save(item);

        System.out.println(savedItem.getItemName());
        //삭제 실행
        itemService.deleteItem(savedItem.getItemId());

        // 검증
        boolean exists = itemRepository.findById(savedItem.getItemId()).isPresent();
    
        assertEquals(false, exists);

        System.out.println("상품 삭제 테스트 성공!!");

    }
    */

    /* 
    public void 존재하지않는상품조회테스트(){

        assertThrows(CustomException.class, ()->{
            itemService.getItem(999999L);
        });

        System.out.println("존재하지 않는 상품 조회 예외 테스트 성공!");
    }
    */

    /*
    public void 음수가격수정테스트(){

        Item item = new Item();

        item.setCategory("침실");
        item.setItemName("침대");
        item.setPrice(100000);
        item.setCurrency("KRW");
        item.setStock(10);

        Item savedItem = itemRepository.save(item);

        ItemUpdateRequestDTO dto = new ItemUpdateRequestDTO();

        dto.setItemName("수정침대");
        dto.setItemDetail("푹신하다고요");
        dto.setPrice(-1000); //음수
        dto.setStock(5);

        assertThrows(IllegalArgumentException.class, ()->{
            itemService.updateItem(savedItem.getItemId(), dto);
        }
    );

    System.out.println("음수 가격 예외 테스트 성공!!");

    }
     */

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

        assertEquals(2, items.size());

        System.out.println("상품 전체조회 테스트성공!!");

    }
    


}
