package com.cmyk.threeh;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.UUID;

import javax.transaction.Transactional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.Payment;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.enums.ItemSellStatus;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.enums.PayType;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.repository.MemberRepository;
import com.cmyk.threeh.repository.OrderRepository;
import com.cmyk.threeh.repository.PaymentRepository;
import com.cmyk.threeh.service.AdminsService;
import com.cmyk.threeh.service.ItemService;
import com.cmyk.threeh.service.MemberService;
import com.cmyk.threeh.service.OrderService;
import com.cmyk.threeh.service.TossPaymentService;

@SpringBootTest
@Import(TestSecurityConfig.class)
@TestPropertySource(properties = {
    "payment.toss.test_client_api_key=test_ck_dummy",
    "payment.toss.test_secrete_api_key=test_sk_dummy",
    "payment.toss.success_url=http://localhost:8080/payment/success",
    "payment.toss.fail_url=http://localhost:8080/payment/fail"
})
@Transactional
public class PaymentTest {

   @Autowired
   MemberService memberService;
   @Autowired
   PaymentRepository paymentRepository;
   @Autowired TossPaymentService tossPaymentService;

     @Autowired OrderService orderService;
    @Autowired OrderRepository orderRepository;
    @Autowired MemberRepository memberRepository;
    @Autowired ItemRepository itemRepository;
    @Autowired AdminsRepository adminsRepository;

    @Autowired
    ItemService itemService;

    private Member savedMember;
    private Admins savedAdmins; 
   

    @BeforeEach
    @Transactional
    void setUp() {
        orderRepository.deleteAll();
        itemRepository.deleteAll();
        adminsRepository.deleteAll(); // ← admin도 지워야 함
        memberRepository.deleteAll();

        savedMember = createMember();
        savedAdmins = createAdmins();
    }

   @Test
   public void requestPayment() throws Exception{
        //given
        Item item = createItem("침대", 1500000, 1);

        Payment payment = Payment.builder()
            .payType(PayType.CARD)
            .amount(1500000L)
            .orderName("침대")
            .orderId(UUID.randomUUID().toString())
            .build();
        //when
        Payment savedPayment = tossPaymentService.requestPayment(payment, savedMember.getEmail());
        //then

        assertNotNull(savedPayment.getPaymentId(), "결제 아이디가 있어야한다.");
        assertEquals(PayType.CARD, savedPayment.getPayType(), "결제 수단이 맞는지");
        assertEquals(1500000L, savedPayment.getAmount(), "금액이 맞는지");
        assertEquals(savedMember.getEmail(), savedPayment.getMember().getEmail(), "결제한 회원이 맞는지");

   }

   private Member createMember() {
    Member member = new Member();
    member.setId("user1" );
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
        dto.setAdminId(1L);
        dto.setAdLoginId("admin1");
        dto.setPassword("123");
        dto.setAdminName("관리자1");
        dto.setRole(MemberRole.ADMIN);
        
        

        return adminsService.createAdmin(dto);
    }

    private Item createItem(String name, int price, int stock) {

        
    
        Item item = new Item();
        item.setItemDetail("이가구가 짱");
        item.setItemName(name);
        item.setItemPrice(price);
        item.setItemStock(stock);                          // ← 추가
        item.setItemCategory("가구");                      // ← 추가
        item.setItemPriceCurrency("KRW");                       // ← 추가
        item.setItemSellStatus(ItemSellStatus.SELL);
         item.setAdmin(savedAdmins);
        item.setAdmin(savedAdmins);
        // ← 추가
        itemRepository.save(item);
        return item;
    }   
    
}
