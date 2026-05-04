package com.cmyk.threeh;

import static org.assertj.core.api.Assertions.assertThat;
import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.dto.DeliveryDTO;
import com.cmyk.threeh.enums.DeliveryStatus;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.service.AdminsService;
import com.cmyk.threeh.service.DeliveryService;

@SpringBootTest
@Transactional
class DeliveryTests {

  

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private AdminsService adminsService;

    @Autowired
    private AdminsRepository adminsRepository;

    private Long sharedAdminId;

    @BeforeAll
    static void setup() {
        // Oracle Cloud Wallet 설정
        System.setProperty("oracle.net.tns_admin", "D:/Wallet_swDB");
        System.setProperty("wallet.path", "D:/Wallet_swDB");
    }

    @BeforeEach
    void init() {
        // 매 테스트 시작 전 공통 관리자 생성
        sharedAdminId = createTemporaryAdmin();
    }

    // 공통으로 사용할 임시 관리자 생성 메서드 (코드 중복 방지)
   private Long createTemporaryAdmin() { 
    Admins admin = new Admins();

    admin.setAdLoginId("test_admin_" + System.currentTimeMillis());
    admin.setPassword("1234");
    admin.setAdminName("임시관리자");
      
    admin.setRole("ADMIN");

    Admins savedAdmin = adminsRepository.saveAndFlush(admin);
    return savedAdmin.getAdminId();
}

    @Test
@DisplayName("배송 업체 등록 및 조회 테스트")
void deliverySaveAndFindTest() {


    assertThat(sharedAdminId).isNotNull();

  
    DeliveryDTO dto = new DeliveryDTO();
    dto.setAdminId(sharedAdminId);

    dto.setCompanyName("대한통운");
    dto.setBusinessName("홍길동");
    dto.setBusinessPhone("02-123-4567");
    dto.setBusinessNo("123-45-67890");
    dto.setBusinessAddr("서울시 강남구");
    dto.setDeliveryName("이순신 기사님");
    dto.setDeliveryPhone("010-1111-2222");
    dto.setDeliveryCarNo("12가 3456");


    // 저장
    Delivery saved = deliveryService.createDelivery(dto);

    // 기본 상태 검증 (WAITING)
    assertThat(saved.getStatus()).isEqualTo(DeliveryStatus.WAITING);

    // 조회 검증
    Delivery found = deliveryService.getDelivery(saved.getDeliveryId());
    assertThat(found.getDeliveryName()).isEqualTo(dto.getDeliveryName());

    // 상태 재검증
    assertThat(found.getStatus()).isEqualTo(DeliveryStatus.WAITING);
}
}