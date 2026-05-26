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
        @RequestBody Map<String, Object> payload) { // String과 Long을 모두 받기 위해 Object로 변경
    
    if (payload.get("deliveryId") == null) {
        return ResponseEntity.badRequest().body("기사 ID가 누락되었습니다.");
    }
    
    Long deliveryId = Long.parseLong(payload.get("deliveryId").toString());
    // 프론트에서 넘겨준 targetStatus(WAITING 또는 PICKUP) 수집, 없으면 기본값 WAITING
    String deliveryStatusStr = payload.getOrDefault("deliveryStatus", "WAITING").toString();

    try {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
                
        Delivery driver = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("기사를 찾을 수 없습니다."));

        // 1. 상태 분기 처리
        if ("PICKUP".equals(deliveryStatusStr)) {
            // 💡 픽업 배정일 때는 orderState(EXCHANGEorREFUND 등)를 절대로 READY로 바꾸지 않고 유지!
            order.setDelivery(driver);
            order.changeDeliveryStatus(DeliveryStatus.PICKUP);
            driver.setStatus(DeliveryStatus.PICKUP);
        } else {
            // 💡 일반 배송 배정일 때만 기존 서비스 로직 실행 (또는 아래처럼 직접 처리)
            adminsService.assignOrder(orderId, deliveryId);
            order.changeDeliveryStatus(DeliveryStatus.WAITING);
        }
        
        orderRepository.save(order);
        deliveryRepository.save(driver);
        
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
public ResponseEntity<?> getAllOrdersForAdmin() {
    System.out.println("=========================================");
    System.out.println("📦 [Admin 백엔드] 전체 주문 목록 조회 요청 시작!");
    System.out.println("=========================================");
    
    try {
        List<OrderResponseDTO> orders = orderService.findAllOrders();
        
        System.out.println("✅ [Admin 백엔드] DB 조회 성공!");
        System.out.println("📊 가져온 데이터 개수: " + (orders != null ? orders.size() : 0) + "건");
        
        if (orders != null && !orders.isEmpty()) {
            System.out.println("👀 첫 번째 데이터 샘플: " + orders.get(0).toString());
        } else {
            System.out.println("⚠️ [경고] DB에서 가져온 데이터가 비어있습니다(Empty).");
        }
        
        return ResponseEntity.ok(orders);
        
    } catch (Exception e) {
        System.out.println("❌ [Admin 백엔드] 에러 발생!");
        e.printStackTrace(); // 스프링 부트 콘솔에 에러 추적 출력
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("백엔드 /admin/orders 처리 중 에러: " + e.getMessage());
    }
}

//엑셀 등록용
// 💡 누락/중복 데이터가 있을 때 실패 목록을 리액트로 돌려주는 최종 API
    @PostMapping("/delivery/bulk")
    public ResponseEntity<?> bulkUpload(
            @RequestBody List<DeliveryExcelDTO> dtos, 
            @AuthenticationPrincipal CustomMemberDetails user
    ) {
        // 1. 시큐리티 세션에 인증된 관리자 정보 객체 가져오기
        if (user == null || user.getAdmins() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("로그인 정보가 없거나 관리자만 등록 가능합니다.");
        }

        Admins admin = user.getAdmins();
        Long adminId = admin.getAdminId(); 

        // 2. 서비스 실행 및 실패 목록 수집
        List<DeliveryExcelDTO> failedList = deliveryService.bulkInsert(dtos, adminId);

        // 3. 실패 자료가 존재할 경우 400 에러와 함께 실패 목록 반환 -> 리액트에서 엑셀 다운로드 트리거
        if (!failedList.isEmpty()) {
            return ResponseEntity.badRequest().body(failedList);
        }

        // 4. 모두 성공 시
        return ResponseEntity.ok("전체 등록 성공!");
    }
   

    // 1. 주문 상태 단순 변경 (예: ORDER -> READY 변경, CANCEL시 기사 삭제 방지)
    @PutMapping("/orders/{orderId}/status")
public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> payload) {
    String statusStr = payload.get("status");
    
    try {
        OrderState newState = OrderState.valueOf(statusStr.toUpperCase()); 
        
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 현재 주문에 연동된 기사 정보 및 배송 상태 추출
        Delivery delivery = order.getDelivery();
        // order.getDeliveryStatus()를 기준으로 현재 배송 단계 체크
        DeliveryStatus currentDeliveryStatus = order.getDeliveryStatus(); 

        // ==========================================
        // [CASE 1] 주문 취소 (CANCEL) 요청이 왔을 때
        // ==========================================
        if (newState == OrderState.CANCEL) {
            
            // 규칙 A: 배송 전 (기사 배정 전 null 이거나 대기 중 WAITING) 일 때만 일반 취소 가능
            if (currentDeliveryStatus == null || currentDeliveryStatus == DeliveryStatus.WAITING) {
                System.out.println("⚠️ [배송 전 취소] 기사 배정 및 배송 상태를 초기화합니다.");
                order.setDelivery(null);    
                order.changeDeliveryStatus(null); 
            } 
            // 규칙 B: 이미 배송 완료(COMPLETED)된 상태에서 취소 요청이 온 경우 -> 수거(PICKUP) 전환
            else if (currentDeliveryStatus == DeliveryStatus.COMPLETED) {
                System.out.println("🔄 [배송 후 취소] 배송 완료 상품이므로 기사 수거(PICKUP) 상태로 전환합니다.");
                
                order.changeDeliveryStatus(DeliveryStatus.PICKUP);
                if (delivery != null) {
                    delivery.setStatus(DeliveryStatus.PICKUP); // 기사 entity 상태도 동기화
                }
            } 
            // 규칙 C: 배송 중(SHIPPING) 등 중간 단계일 때는 취소 거부
            else {
                return ResponseEntity.badRequest().body("현재 배송 진행 중(" + currentDeliveryStatus + ")이므로 취소가 불가능합니다. 배송 완료 후 처리해주세요.");
            }
        }
        
        // ==========================================
        // [CASE 2] 교환 (EXCHANGEorREFUND) 요청이 왔을 때
        // ==========================================
        else if (newState == OrderState.EXCHANGEorREFUND) {
            // 교환은 무조건 배송이 완료된 상태에서만 수거(PICKUP) 프로세스로 진입 가능
            if (currentDeliveryStatus == DeliveryStatus.COMPLETED) {
                System.out.println("🔄 [교환 요청] 배송 완료 상품이므로 기사 수거(PICKUP) 상태로 전환합니다.");
                
                order.changeDeliveryStatus(DeliveryStatus.PICKUP);
                if (delivery != null) {
                    delivery.setStatus(DeliveryStatus.PICKUP);
                }
            } else {
                return ResponseEntity.badRequest().body("배송 완료(COMPLETED) 상태의 주문만 교환 신청이 가능합니다.");
            }
        }

        // 최종 주문 상태 변경 후 저장
        order.changeOrderState(newState);
        orderRepository.save(order);
        
        // 💡 JPA 영속성 컨텍스트 특성상 영속 상태의 delivery 변경점도 함께 저장됩니다.
        if (delivery != null) {
            deliveryRepository.save(delivery); 
        }
        
        return ResponseEntity.ok("주문 상태가 [" + newState + "]로 변경되었습니다.");
        
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body("잘못된 상태 값입니다: " + statusStr);
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body("서버 오류: " + e.getMessage());
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
        order.changeDeliveryStatus(DeliveryStatus.WAITING); 
        
    } else if ("REJECT".equals(action)) {
        // 기사가 거절했을 때의 처리
        order.setDelivery(null); // 배정되었던 기사 연결 해제
        order.changeOrderState(OrderState.READY); // 주문은 다시 '배송 준비중'으로 변경
        order.changeDeliveryStatus(DeliveryStatus.REJECTED); // 💡 가지고 계신 REJECTED 활용!
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
    
    // 현재 배송 상태와 주문 상태를 미리 파악합니다.
    DeliveryStatus currentDeliveryStatus = order.getDeliveryStatus();
    OrderState currentOrderState = order.getOrderState();

    // =============================================================
    // 🔄 [수정] 반품/교환/취소 건의 '수거 완료(PICKUP 상태에서 완료)'인 경우
    // =============================================================
    if (currentDeliveryStatus == DeliveryStatus.PICKUP) {
        System.out.println("📦 [회수 완료 처리] PICKUP -> COMPLETED 전환 (주문 상태 " + currentOrderState + " 유지)");
        
        // 기사와 주문의 배송 상태는 완료(COMPLETED)로 바꾸되
        order.getDelivery().setStatus(DeliveryStatus.COMPLETED);
        order.changeDeliveryStatus(DeliveryStatus.COMPLETED);
        
        // 🔥 핵심: 기존의 EXCHANGEorREFUND 또는 CANCEL 상태가 변하지 않도록 강제로 다시 한번 세팅하거나 보존합니다.
        order.changeOrderState(currentOrderState); 
    } 
    // =============================================================
    // 🚚 [기본] 일반 배송 건의 '배송 완료'인 경우
    // =============================================================
    else {
        System.out.println("🚚 [일반 배송 완료 처리] SHIPPING -> COMPLETED 전환");
        order.getDelivery().setStatus(DeliveryStatus.COMPLETED);
        order.changeDeliveryStatus(DeliveryStatus.COMPLETED);
        
        // 일반 배송 완료 시 주문 상태를 유지하거나 비즈니스 규칙에 맞게 세팅 (필요시 추가)
        if (currentOrderState == OrderState.ORDER) {
            // 필요하다면 배송완료 후의 특정 OrderState로 변경 가능 (ex: order.changeOrderState(OrderState.COMPLETE);)
            order.changeOrderState(currentOrderState);
        }
    }

    orderRepository.save(order);
    return ResponseEntity.ok("완료 처리되었습니다.");
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

    //교환 환불
    @PostMapping("/orders/{orderId}/assign-pickup")
public ResponseEntity<?> assignPickupDriver(
        @PathVariable Long orderId, 
        @RequestBody Map<String, String> payload) { // 리액트 select에서 String으로 넘어올 수 있으므로 String 처리 후 파싱
    
    String deliveryIdStr = payload.get("deliveryId");
    if (deliveryIdStr == null || deliveryIdStr.isEmpty()) {
        return ResponseEntity.badRequest().body("배정할 기사 ID가 없습니다.");
    }

    try {
        Long deliveryId = Long.parseLong(deliveryIdStr);

        // 1. 주문 조회 (기존 Entity 이름인 Orders 적용 및 예외 처리 통일)
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 2. 기사 조회
        Delivery driver = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("해당 배송 기사를 찾을 수 없습니다."));

        // 3. 검증: 주문 상태가 반품/교환(EXCHANGEorREFUND)이거나 취소(CANCEL)인지 확인
        OrderState currentState = order.getOrderState();
        if (currentState != OrderState.EXCHANGEorREFUND && currentState != OrderState.CANCEL) {
            return ResponseEntity.badRequest().body("반품/교환 또는 취소 접수 상태의 주문만 픽업 배정이 가능합니다.");
        }

        // 4. 상태 변경: deliveryStatus를 COMPLETED -> PICKUP으로 전환
        order.setDelivery(driver); // 픽업을 담당할 기사 배정
        order.changeDeliveryStatus(DeliveryStatus.PICKUP); // 💡 요청하신 대로 PICKUP으로 변경!
        
        // 기사 엔티티의 현재 업무 상태도 PICKUP으로 동기화
        driver.setStatus(DeliveryStatus.PICKUP); 

        // 5. DB 저장
        orderRepository.save(order);
        deliveryRepository.save(driver);

        System.out.println("🔄 [픽업 배정 완료] 주문ID: " + orderId + " -> 기사ID: " + deliveryId + " (상태: PICKUP)");
        return ResponseEntity.ok("성공적으로 픽업 기사가 배정되었으며, 픽업(PICKUP) 상태로 전환되었습니다.");

    } catch (NumberFormatException e) {
        return ResponseEntity.badRequest().body("잘못된 기사 ID 형식입니다.");
    } catch (CustomException e) {
        return ResponseEntity.badRequest().body("주문을 찾을 수 없습니다.");
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body("서버 오류: " + e.getMessage());
    }
}

}



