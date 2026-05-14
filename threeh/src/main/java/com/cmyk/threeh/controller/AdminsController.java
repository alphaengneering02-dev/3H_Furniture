package com.cmyk.threeh.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.SessionMember;
import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.CustomMemberDetails;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.dto.AdminLoginDTO;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.dto.DeliveryDTO;
import com.cmyk.threeh.dto.DeliveryExcelDTO;
import com.cmyk.threeh.dto.OrderResponseDTO;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.service.AdminsService;
import com.cmyk.threeh.service.DeliveryService;
import com.cmyk.threeh.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminsController {

    private final DeliveryService deliveryService;
    private final AdminsService adminsService;
    private final AdminsRepository adminsRepository;
    private final OrderService orderService;


    @PostMapping("/delivery")
public ResponseEntity<?> addDelivery(@RequestBody DeliveryDTO dto) {
    System.out.println("======> 요청이 도착했습니다!");
    System.out.println("전달받은 adminId: " + dto.getAdminId());
    
    deliveryService.createDelivery(dto);
    
    System.out.println("======> 저장 성공!");
    return ResponseEntity.ok("성공");
}

    // 
   @GetMapping("/list")
public List<Delivery> getAllDeliveries(HttpSession session) {
    // 세션에서 꺼낼 때 'sessionMember' 키가 로그인 때 저장한 키와 같은지 확인
    SessionMember user = (SessionMember) session.getAttribute("sessionMember");
    
    if (user != null) {
        System.out.println("👤 조회자: " + user.getAdminName()); // 이제 admin1이 뜰 겁니다.
    }
    
    return deliveryService.getAllDeliveries(); 
}
/* 
    // 3. 단건 조회 (READ ONE)
    @GetMapping("/{id}")
    public Delivery getOne(@PathVariable Long id) {
        return deliveryService.getDelivery(id);
    }

    // 4. 대기 목록
    @GetMapping("/waiting")
    public List<Delivery> getWaiting() {
        return deliveryService.getWaitingDeliveries();
    }

    // 5. 완료 목록
    @GetMapping("/completed")
    public List<Delivery> getCompleted() {
        return deliveryService.getCompletedDeliveries();
    }
*/
   //수정
    @PutMapping("/delivery/{deliveryid}")
    public Delivery update(@PathVariable("deliveryid") Long id, @RequestBody DeliveryDTO dto) {
    return deliveryService.updateDelivery(id, dto);
}

    // 6. 삭제 (DELETE)
    @DeleteMapping("/delivery-companies/{deliveryid}")
    public void delete(@PathVariable("deliveryid") Long id) {
        deliveryService.deleteDelivery(id);
    }
     @GetMapping("/delivery/{id}")
    public Delivery getOne(@PathVariable("id") Long id) {
        return deliveryService.getDelivery(id);
    }

  @GetMapping("/{loginId}") 
public ResponseEntity<AdminsDTO> getAdminIdByLoginId(@PathVariable("loginId") String loginId) {

    //추가 오현옥
    loginId = loginId.trim();

    System.out.println("🔍 관리자 데이터 조회 요청 - Login ID: " + loginId);
    
    // 1. DB에서 관리자 엔티티 조회
    Admins admin = adminsRepository.findByAdLoginId(loginId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
    
    // 2. AdminsDTO 객체 생성 및 데이터 복사 (비밀번호는 제외!)
    AdminsDTO dto = new AdminsDTO();
    dto.setAdminId(admin.getAdminId());
    dto.setAdLoginId(admin.getAdLoginId());
    dto.setAdminName(admin.getAdminName());
    dto.setRole(admin.getRole());
    
    // 로그 출력
    System.out.println("✅ 조회 성공 - Admin ID: " + dto.getAdminId() + ", Name: " + dto.getAdminName());
    
    // 3. DTO 객체 반환
    return ResponseEntity.ok(dto);
}

    // 배송 기사 배정 API
@PostMapping("/orders/{orderId}/assign")
public ResponseEntity<?> assignOrderToDelivery(
        @PathVariable("orderId") Long orderId, 
        @RequestBody Map<String, Long> payload) {
    
    // JSON 보디에서 deliveryId 추출
    Long deliveryId = payload.get("deliveryId");
    
    if (deliveryId == null) {
        return ResponseEntity.badRequest().body("기사 ID가 누락되었습니다.");
    }

    try {
        // 배정 로직 실행
        adminsService.assignOrder(orderId, deliveryId);
        return ResponseEntity.ok("배정이 완료되었습니다.");
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body("배정 중 오류: " + e.getMessage());
    }
}
 @PostMapping("/login")
public ResponseEntity<?> login(
        @RequestBody AdminLoginDTO dto,
        HttpServletRequest request) { // HttpSession 대신 HttpServletRequest 사용 권장

    Admins admin = adminsService.login(dto.getLoginId(), dto.getPassword());

    if (admin == null) {
        return ResponseEntity.badRequest().body("아이디 또는 비밀번호가 틀렸습니다.");
    }

    // 기존 세션이 있다면 무효화하고 새로 생성 (보안 및 꼬임 방지)
    HttpSession session = request.getSession(true); 
    session.setAttribute("sessionMember", new SessionMember(admin));

    System.out.println("세션 생성됨: " + session.getId()); // ID를 로그로 찍어서 유지되는지 확인
    return ResponseEntity.ok("로그인 성공");
}

    @GetMapping("/me")
public ResponseEntity<?> getMyInfo(HttpSession session) {
    // 세션에서 정보 꺼내기
    SessionMember user = (SessionMember) session.getAttribute("sessionMember");

    if (user == null) {
        System.out.println("❌ [Admin/Me] 세션이 비어있습니다.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 안됨");
    }

    // 관리자 세션인지 일반 멤버 세션인지 구분 로그
    System.out.println("✅ [Admin/Me] 현재 접속자: " + user.getAdminName() + " (Role: " + user.getRole() + ")");
    return ResponseEntity.ok(user);
}

@GetMapping("/orders")
public ResponseEntity<List<OrderResponseDTO>> getAllOrdersForAdmin() {
    System.out.println("📦 [Admin] 전체 주문 목록 조회 요청");
    
    List<OrderResponseDTO> orders = orderService.findAllOrders();
    
    return ResponseEntity.ok(orders);
}

//엑셀 등록용
@PostMapping("/delivery/bulk")
public ResponseEntity<?> bulkInsert(
        @RequestBody List<DeliveryExcelDTO> list,
        @AuthenticationPrincipal CustomMemberDetails user
) {
    Admins admin = user.getAdmins();

    if (admin == null) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("관리자만 등록 가능합니다.");
    }

    Long adminId = admin.getAdminId();

    deliveryService.bulkInsert(list, adminId);

    return ResponseEntity.ok().build();
}






}

