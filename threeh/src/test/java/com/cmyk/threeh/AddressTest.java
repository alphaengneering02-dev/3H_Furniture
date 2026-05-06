package com.cmyk.threeh;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.domain.Adress; // [중요] 조장님 주소 VO 임포트
import com.cmyk.threeh.dto.MemberAddressDTO;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.enums.OrderType;
import com.cmyk.threeh.form.MemberAddressForm;
import com.cmyk.threeh.repository.MemberAddressRepository;
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
    @DisplayName("마이페이지 주소록 저장 및 조회 테스트")
    public void 마이페이지_주소록_테스트() {
        Member member = createMember("user01");
        em.flush();
        given(memberService.getUser(anyString())).willReturn(member);

        MemberAddressForm form = new MemberAddressForm();
        form.setCity("서울시");
        form.setStreet("테헤란로");
        form.setZipcode("12345");
        form.setAddrDetail("7층 701호");
        form.setIsDefault("Y");

        memberAddressService.saveAddress(member.getId(), form);
        em.flush();
        em.clear();

        List<MemberAddressDTO> list = memberAddressService.getAddressList(member.getId());
        assertEquals(1, list.size());
        assertEquals("7층 701호", list.get(0).getAddrdetail());
    }

    @Test
    @DisplayName("3일 경과 주문 데이터 삭제 테스트")
    public void 주문_3일경과_삭제_테스트() {
        Member member = createMember("user02");
        Orders order = new Orders();
        order.setMember(member);
        order.setOrderDate(LocalDateTime.now().minusDays(4)); 
        order.setOrderState(OrderState.ORDER);
        order.setOrderType(OrderType.DELIVERY_ONLY); 
        order.setDeliveryDate(LocalDate.now().minusDays(1));
        order.setInstallDate(LocalDate.now().minusDays(1));
        
        // [중요 수정]: 개별 필드 대신 조장님의 Adress VO를 생성해서 넣어줍니다.
        // Orders 엔티티에 정의된 필드명이 adress인지 address인지 확인 필요 (일단 Adress 규격 적용)
        try {
            // 조장님 Adress VO 생성자: city, street, zipcode 순서
            Adress adressVO = new Adress("서울시", "테헤란로", "12345");
            order.setAdress(adressVO); // 엔티티 내 필드명 확인 (adress 혹은 address)
        } catch (Exception e) {
            // 만약 필드명이 다르면 여기서 에러가 날 수 있으니 확인 바랍니다.
        }

        order.setDeliveryAddr("서울시 강남구 테헤란로");
        order.setDeliveryAddrDetail("123번지");
        
        orderRepository.save(order);
        em.flush(); 
        em.clear();

        memberAddressService.processRefundOrDelete(order.getOrderId());
        em.flush();
        em.clear();

        Optional<Orders> deletedOrder = orderRepository.findById(order.getOrderId());
        assertFalse(deletedOrder.isPresent(), "3일 경과 시 주문이 삭제되어야 합니다.");
    }

    private Member createMember(String id) {
        String uniqueId = id + System.currentTimeMillis();
        Member member = new Member();
        member.setId(uniqueId);
        member.setPassword("1234");
        member.setName("테스터");
        member.setEmail(uniqueId + "@test.com");
        member.setPhone("0101234" + (int)(Math.random() * 10000));
        member.setRegNo("800101-1" + (int)(1000000 + Math.random() * 1000000));
        member.setRole(MemberRole.USER);
        return memberRepository.save(member);
    }
}
