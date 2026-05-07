package com.cmyk.threeh;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.ActiveProfiles;

import com.cmyk.threeh.domain.Adress;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.MemberAddress;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.dto.MemberAddressDTO;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.enums.OrderType;
import com.cmyk.threeh.repository.MemberRepository;
import com.cmyk.threeh.repository.OrderRepository;
import com.cmyk.threeh.service.MemberAddressService;
import com.cmyk.threeh.service.MemberService;

@SpringBootTest(properties = {
    "spring.session.store-type=none",
    "spring.main.allow-bean-definition-overriding=true",
    "payment.toss.test_client_api_key=test_ck_4yKeq5bgrpKLdW2mBbdBVGX0lzW6",
    "payment.toss.test_secrete_api_key=test_sk_k_26DlbXAaV0dqqGlRkRXbVqY50Q9R",
    "payment.toss.success_url=http://localhost:8080/payment/toss/success",
    "payment.toss.fail_url=http://localhost:8080/payment/toss/fail"
})
@Transactional
@ActiveProfiles("local")
@Import(TestSecurityConfig.class)
public class AddressTest {

    @BeforeAll
    static void setup() {
        String walletPath = "C:/Users/human-23/Desktop/파이널프로젝트/Wallet_swDB";
        System.setProperty("oracle.net.tns_admin", walletPath);
        System.setProperty("wallet.path", walletPath);
        System.setProperty("spring.datasource.url", "jdbc:oracle:thin:@swdb_high?TNS_ADMIN=" + walletPath);
        System.setProperty("spring.datasource.username", "admin");
        System.setProperty("spring.datasource.password", "@Alibi240319");
    }

    @MockBean private ClientRegistrationRepository clientRegistrationRepository;
    @MockBean private MemberService memberService; 

    @Autowired private MemberAddressService memberAddressService;
    @Autowired private MemberRepository memberRepository;
    @Autowired private OrderRepository orderRepository; 
    @Autowired private EntityManager em;

    @Test
    @DisplayName("기본 배송지 자동 연동 성공 테스트")
    public void 기본_배송지_연동_성공() {
        // 1. Given
        Member member = createMember("userY");
        given(memberService.getUser(anyString())).willReturn(member);

        MemberAddress addr = new MemberAddress();
        addr.setMember(member);
        addr.setAddr("서울시 강남구 테헤란로");
        addr.setAddrDetail("101호");
        addr.setIsDefault("Y");
        
        // [해결] ORA-01400 에러 방지: 필수값인 Adress VO를 채워줌 (city, street, zipcode)
        addr.setAdressl(new Adress("서울시", "테헤란로", "12345")); 
        
        em.persist(addr);
        em.flush();
        em.clear();

        // 2. When
        MemberAddressDTO result = memberAddressService.getDefaultAddressForOrder(member.getId());

        // 3. Then
        assertEquals("서울시 강남구 테헤란로", result.getAddr());
        assertEquals("101호", result.getAddrdetail());
    }

    @Test
    @DisplayName("기본 배송지 없을 때 NoSuchElementException 발생 테스트")
    public void 기본_배송지_부재_예외_테스트() {
        Member member = createMember("userN");
        given(memberService.getUser(anyString())).willReturn(member);

        assertThrows(NoSuchElementException.class, () -> {
            memberAddressService.getDefaultAddressForOrder(member.getId());
        });
    }

    @Test
    @DisplayName("배송 시작 전(ORDER) 일정 변경 성공 테스트")
    public void 일정_변경_성공_테스트() {
        Member member = createMember("orderUser");
        Orders order = new Orders();
        order.setMember(member);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderState(OrderState.ORDER);
        order.setOrderType(OrderType.DELIVERY_ONLY);
        order.setDeliveryAddr("서울시 강남구");
        order.setDeliveryDate(LocalDate.now().plusDays(3));
        
        orderRepository.save(order);
        em.flush();

        LocalDate newDate = LocalDate.now().plusDays(10);
        memberAddressService.updateDeliverySchedule(order.getOrderId(), newDate);
        em.flush();
        em.clear();

        Orders updatedOrder = orderRepository.findById(order.getOrderId()).get();
        assertEquals(newDate, updatedOrder.getDeliveryDate());
    }

    @Test
    @DisplayName("배송 시작 후 일정 변경 실패 테스트 (IllegalStateException)")
    public void 일정_변경_실패_테스트() {
        Member member = createMember("cancelUser");
        Orders order = new Orders();
        order.setMember(member);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderState(OrderState.CANCEL);
        order.setOrderType(OrderType.DELIVERY_ONLY);
        order.setDeliveryAddr("서울시 서초구");
        order.setDeliveryDate(LocalDate.now().plusDays(3));
        
        orderRepository.save(order);
        em.flush();

        assertThrows(IllegalStateException.class, () -> {
            memberAddressService.updateDeliverySchedule(order.getOrderId(), LocalDate.now().plusDays(10));
        });
    }

    private Member createMember(String id) {
        String uniqueId = id + System.currentTimeMillis();
        Member member = new Member();
        member.setId(uniqueId);
        member.setPassword("1234");
        member.setName("테스터");
        member.setEmail(uniqueId + "@test.com");
        member.setPhone("010" + (int)(Math.random() * 10000000));
        member.setRegNo("800101-1" + (int)(1000000 + Math.random() * 1000000));
        member.setRole(MemberRole.USER);
        return memberRepository.save(member);
    }
}
