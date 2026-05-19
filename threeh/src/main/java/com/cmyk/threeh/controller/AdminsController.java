package com.cmyk.threeh.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.SessionMember;
import com.cmyk.threeh.enums.DeliveryStatus;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
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
import com.cmyk.threeh.repository.DeliveryRepository;
import com.cmyk.threeh.repository.OrderRepository;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminsController {

    private final DeliveryService deliveryService;
    private final AdminsService adminsService;
    private final AdminsRepository adminsRepository;
    private final OrderService orderService;
     private final OrderRepository orderRepository;
    private final DeliveryRepository deliveryRepository;


    @PostMapping("/delivery")
public ResponseEntity<?> addDelivery(@RequestBody DeliveryDTO dto) {
    System.out.println("======> 요청이 도착했습니다!");
    System.out.println("전달받은 adminId: " + dto.getAdminId());
    
    deliveryService.createDelivery(dto);
    
    System.out.println("======> 저장 성공!");
    return ResponseEntity.ok("성공");
}

    // 딜리버리 리스트
  @GetMapping("/list")
public ResponseEntity<?> getAllDeliveries(HttpSession session) {
    try {
        System.out.println("======> 기사 리스트 조회 시작");
        
        // 1. 세션 체크 (이 부분에서 에러가 많이 납니다)
        Object sessionObj = session.getAttribute("sessionMember");
        if (sessionObj != null) {
            System.out.println("조회 시도자: " + sessionObj.toString());
        }

        // 2. 실제 데이터 가져오기
        List<Delivery> list = deliveryService.getAllDeliveries();
        
        System.out.println("======> 조회 성공, 데이터 개수: " + (list != null ? list.size() : 0));
        return ResponseEntity.ok(list);

    } catch (Exception e) {
        // 🔥 에러가 나면 콘솔에 빨간 줄을 긋고, 브라우저로 에러 내용을 보냅니다.
        e.printStackTrace(); 
        return ResponseEntity.status(500).body("백엔드 에러 발생 원인: " + e.toString());
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
    dto.setPassword(admin.getPassword());
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
    
    Long deliveryId = payload.get("deliveryId");
    if (deliveryId == null) {
        return ResponseEntity.badRequest().body("기사 ID가 누락되었습니다.");
    }

    try {
        // 기사 배정 처리 (주문에 기사 ID 맵핑)
        adminsService.assignOrder(orderId, deliveryId);
        
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

        order.changeDeliveryStatus(null); 
        orderRepository.save(order);
        
        return ResponseEntity.ok("배정이 완료되었습니다. 기사의 수락을 대기합니다.");
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

   

    // 1. 주문 상태 단순 변경 (예: ORDER -> READY)
    @PutMapping("/orders/{orderId}/status")
public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> payload) {
    String statusStr = payload.get("status");
    
    try {
        // Enum에 존재하는지 먼저 체크
        OrderState newState = OrderState.valueOf(statusStr.toUpperCase()); 
        
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        order.changeOrderState(newState);
        orderRepository.save(order);
        return ResponseEntity.ok("상태 변경 완료");
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body("잘못된 상태 값입니다: " + statusStr);
    }
}


// --- 기사 전용 기능 (Admin 경로 내 통합) ---

/**
 * 1. 기사 로그인 
 * URL: POST /admin/driver/login
 */
@PostMapping("/driver/login")
public ResponseEntity<?> driverLogin(@RequestBody Map<String, String> payload) {
    String inputPhone = payload.get("phone").replaceAll("-", ""); // 입력값에서 하이픈 제거
    String carSuffix = payload.get("carSuffix");

    // DB의 모든 기사를 가져와서 비교 (또는 하이픈 없는 번호로 조회하는 쿼리 필요)
    List<Delivery> allDrivers = deliveryRepository.findAll();
    
    Delivery target = allDrivers.stream()
            .filter(d -> {
                String dbPhone = d.getDeliveryPhone().replaceAll("-", ""); // DB값에서 하이픈 제거
                boolean phoneMatch = dbPhone.equals(inputPhone);
                boolean carMatch = d.getDeliveryCarNo() != null && d.getDeliveryCarNo().endsWith(carSuffix);
                return phoneMatch && carMatch;
            })
            .findFirst()
            .orElse(null);

    if (target == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("일치하는 기사 정보가 없습니다.");
    }

    return ResponseEntity.ok(target);
}

/**
 * 2. 특정 기사에게 배정된 주문 목록 조회
 * URL: GET /admin/driver/{deliveryId}/orders
 */
@GetMapping("/driver/{deliveryId}/orders")
public ResponseEntity<?> getDriverOrders(@PathVariable Long deliveryId) {

    System.out.println("요청된 기사 ID: " + deliveryId);

    List<Orders> orders = orderRepository.findByDelivery_DeliveryId(deliveryId);

    System.out.println("조회된 주문 개수: " + orders.size());

    List<OrderResponseDTO> result = orders.stream()
            .map(OrderResponseDTO::from)
            .collect(java.util.stream.Collectors.toList());

    return ResponseEntity.ok(result);
}


 // 3. 기사의 수락/거절 응답 처리(waiting 유지)
@PatchMapping("/driver/orders/{orderId}/response")
public ResponseEntity<?> handleDriverResponse(
        @PathVariable Long orderId,
        @RequestBody Map<String, String> payload) {
    
    String action = payload.get("action");
    Orders order = orderRepository.findById(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

    if ("ACCEPT".equals(action)) {
        // 수락 시 WAITING 상태 유지
        order.changeDeliveryStatus(DeliveryStatus.WAITING);
    } else if ("REJECT".equals(action)) {
        // 거절 시 기사 연결 해제 및 배송 상태를 REJECTED로 명시적 변경
        order.setDelivery(null); 
        order.changeOrderState(OrderState.READY); 
        order.changeDeliveryStatus(DeliveryStatus.REJECTED); // 💡 프론트가 즉시 인지하도록 처리
    } else {
        return ResponseEntity.badRequest().body("잘못된 action 값입니다.");
    }

    orderRepository.save(order);
    return ResponseEntity.ok("처리되었습니다.");
}
// 배송 출발(waiting -> SHIPPING)
@PostMapping("/orders/{orderId}/start")
public ResponseEntity<?> startDelivery(@PathVariable Long orderId) {

    Orders order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("주문 없음"));

    Delivery delivery = order.getDelivery();

    if (delivery == null) {
        return ResponseEntity.badRequest().body("기사 배정 안됨");
    }

    // 1. 기사의 상태를 SHIPPING으로 변경
    delivery.setStatus(DeliveryStatus.SHIPPING);

    order.changeDeliveryStatus(DeliveryStatus.SHIPPING); 
    orderRepository.save(order);

    return ResponseEntity.ok("배송 시작");
}


//배송완료 ( SHIPPING  -> complete)
@PostMapping("/orders/{orderId}/complete")
public ResponseEntity<?> completeDelivery(@PathVariable Long orderId) {
    Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("해당 주문을 찾을 수 없습니다."));
    
    if (order.getDelivery() == null) {
        return ResponseEntity.badRequest().body("해당 주문에 배정된 기사가 없습니다.");
    }
    
    // 1. 기사의 상태를 COMPLETED로 변경
    order.getDelivery().setStatus(DeliveryStatus.COMPLETED);

    // 💡 2. [추가] 주문(Orders)의 배송 상태도 COMPLETED로 함께 변경!
    order.changeDeliveryStatus(DeliveryStatus.COMPLETED);

    orderRepository.save(order);
    return ResponseEntity.ok("배송 완료 처리되었습니다.");
}

//기사님 복귀(complete -> waiting)
@PutMapping("/driver/{deliveryId}/reset-status")
    public ResponseEntity<?> resetDriverStatusToWaiting(@PathVariable Long deliveryId) {
        System.out.println("🔄 기사 [" + deliveryId + "] 상태 대기(WAITING)로 리셋 요청");
        
        // 1. 기사 정보 DB에서 조회
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("해당 배송 기사를 찾을 수 없습니다."));
        
        // 2. 기사의 개인 상태를 WAITING으로 리셋
        delivery.setStatus(DeliveryStatus.WAITING);
        
        // 3. DB에 업데이트 반영
        deliveryRepository.save(delivery);
        
        System.out.println("✅ 기사 [" + deliveryId + "] 상태가 WAITING으로 리셋 완료되어 DB에 반영되었습니다.");
        return ResponseEntity.ok("기사 상태가 WAITING으로 전환되었습니다.");
    }
}

