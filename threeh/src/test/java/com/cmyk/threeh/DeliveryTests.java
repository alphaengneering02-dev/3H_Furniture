package com.cmyk.threeh;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.dto.DeliveryDTO;
import com.cmyk.threeh.enums.DeliveryStatus;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.repository.DeliveryRepository;
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

    @Autowired
    private DeliveryRepository deliveryRepository;

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
/* 등록

    @Test
@DisplayName("배송 업체 등록 및 조회 테스트")
@Rollback(false)
void deliverySaveAndFindTest() {

    Delivery delivery = new Delivery();
    assertThat(sharedAdminId).isNotNull();

  
    DeliveryDTO dto = new DeliveryDTO();
    dto.setAdminId(sharedAdminId);

    long testId = (long)(Math.random() * 90000000L) + 10000000L;
    delivery.setDeliveryId(testId);

    dto.setCompanyName("GS통운");
    dto.setBusinessName("구구콘");
    dto.setBusinessPhone("02-321-9874");
    dto.setBusinessNo("321-45-67890");
    dto.setBusinessAddr("서울시 강원구");
    dto.setDeliveryName("배수아");
    dto.setDeliveryPhone("010-1332-2882");
    dto.setDeliveryCarNo("21가 8888");


    // 저장
    Delivery saved = deliveryService.createDelivery(dto);

    // 기본 상태 검증 (WAITING)
    assertThat(saved.getStatus()).isEqualTo(DeliveryStatus.WAITING);

    // 조회 검증
    Delivery found = deliveryService.getDelivery(saved.getDeliveryId());
    assertThat(found.getDeliveryName()).isEqualTo(dto.getDeliveryName());
    assertNotNull(delivery.getDeliveryId());
    System.out.println("생성된 랜덤 ID: " + delivery.getDeliveryId());

    // 상태 재검증
    assertThat(found.getStatus()).isEqualTo(DeliveryStatus.WAITING);
}
  */   

/* 수정
@Test
@Rollback(false)
@DisplayName("기사 전화번호 수정하기")
void updateDeliveryPhoneTest() {
    // Given
    Long targetId = 61L;
    String newPhone = "010-6666-0000";
    String newCarNo = "99가 9999";


// DB에서 현재 저장된 데이터를 통째로 불러옵니다. (모든 정보가 포함됨)
    Delivery delivery = deliveryRepository.findById(targetId)
            .orElseThrow(() -> new RuntimeException("해당 ID의 기사를 찾을 수 없습니다: " + targetId));

    delivery.setDeliveryPhone(newPhone);
    delivery.setDeliveryCarNo(newCarNo);

    // 리포지토리를 직접 사용하여 저장 후 결과를 확인합니다.
    Delivery updated = deliveryRepository.save(delivery);

    // 3. 검증 (Then)
    assertThat(updated).isNotNull();
    assertThat(updated.getDeliveryPhone()).isEqualTo(newPhone);
    
    System.out.println("✅ 수정 완료!");
    System.out.println("회사명: " + updated.getCompanyName());
    System.out.println("변경된 번호: " + updated.getDeliveryPhone());
}
 */
 
/* //리스트 조회
@Test
@DisplayName("배송 상태별 목록 조회 테스트")
void deliveryListByStatusTest() {
    // 1. Given:
    List<Delivery> waitingList = deliveryService.getWaitingDeliveries();
    
    // 3.'배송 완료'된 배송 건들 조회
    List<Delivery> completedList = deliveryService.getCompletedDeliveries();

    // 4. Then: 검증
    System.out.println("=== 조회 결과 ===");
    System.out.println("대기 중인 건수: " + waitingList.size());
    System.out.println("완료된 건수: " + completedList.size());

    // 대기 중인 리스트는 모두 상태가 WAITING이어야 함
    if(!waitingList.isEmpty()) {
        assertThat(waitingList.get(0).getStatus()).isEqualTo(DeliveryStatus.WAITING);
    }
}
*/
/* //단건 삭제
@Test
@Rollback(false)
@DisplayName("특정 배송 기사 데이터 삭제")
void deleteDeliveryTest() {
    Long targetId = 90911464L;

    // 방법 1: 리포지토리에서 바로 삭제
    deliveryRepository.deleteById(targetId);

    // 검증: 삭제되었으므로 존재하지 않아야 함
    boolean exists = deliveryRepository.existsById(targetId);
    assertThat(exists).isFalse();

    System.out.println("✅ " + targetId + "번 기사 정보가 삭제되었습니다.");
}
*/
/* // 모든 데이터 삭제
@Test
@Rollback(false)
@DisplayName("배송 테이블 전체 삭제")
void deleteAllDeliveries() {
    deliveryRepository.deleteAll(); 
    
    long count = deliveryRepository.count();
    assertThat(count).isEqualTo(0);
    
    System.out.println("✅ 테이블이 완전히 비워졌습니다.");
}
 */

@Test
@DisplayName("복합 조건 검색 테스트 (회사명 + 상태)")
void findByCompanyAndStatusTest() {
    // Given: 테스트 데이터가 DB에 있다는 가정 하에
    String companyName = "빠른택배";
    //DeliveryStatus status = DeliveryStatus.WAITING;

    // When: Query Method나 JPQL이 잘 작동하는지 확인
    List<Delivery> results = deliveryRepository.findByCompanyNameContaining(companyName);

    // Then
    System.out.println("🔍 검색 결과 건수: " + results.size());
    for (Delivery d : results) {
        System.out.println("결과: " + d.getCompanyName() + " / " + d.getStatus());
        assertThat(d.getCompanyName()).contains(companyName);
    }
}





}


