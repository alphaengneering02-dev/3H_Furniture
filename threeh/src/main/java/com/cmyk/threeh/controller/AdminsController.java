package com.cmyk.threeh.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.SessionMember;
import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.dto.AdminLoginDTO;
import com.cmyk.threeh.dto.DeliveryDTO;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.service.AdminsService;
import com.cmyk.threeh.service.DeliveryService;
import com.cmyk.threeh.dto.SessionMember;
import org.springframework.http.HttpStatus;

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
public List<Delivery> getAllDeliveries(HttpSession session) { // HttpSession 주입
    try {
        // 세션에서 로그인 정보 꺼내기
        SessionMember user = (SessionMember) session.getAttribute("sessionMember");
        
        System.out.println("=== [/admin/list] API 호출됨 ===");
        
        if (user != null) {
            // 관리자면 adminName, 일반유저면 name 출력
            String userName = (user.getAdminId() != null) ? user.getAdminName() : user.getName();
            System.out.println("👤 조회자: " + userName + " (" + user.getRole() + ")");
        } else {
            System.out.println("⚠️ 조회자: 로그인 정보 없음 (익명)");
        }

        List<Delivery> list = deliveryService.getAllDeliveries();
        System.out.println("📦 조회 건수: " + list.size());
        return list;

    } catch (Exception e) {
        System.out.println("🔥 에러 발생: " + e.getMessage());
        throw e;
    }
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
public ResponseEntity<Long> getAdminIdByLoginId(@PathVariable("loginId") String loginId) {
    System.out.println("🔍 관리자 ID 조회 요청 - Login ID: " + loginId);
    
    Long adminId = adminsRepository.findByAdLoginId(loginId)
            .orElseThrow(() -> new RuntimeException("Admin not found"))
            .getAdminId();
     
      System.out.println(loginId);
            System.out.println(adminId);
    return ResponseEntity.ok(adminId);

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




}

