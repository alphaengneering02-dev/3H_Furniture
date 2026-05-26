package com.cmyk.threeh.controller;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.domain.OrderItem;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.repository.OrderRepository;
import com.cmyk.threeh.service.MemberAddressService;
import com.cmyk.threeh.service.MemberService;
import com.cmyk.threeh.global.util.GetLoginId;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/Member")
public class MemberAddressController {

    private final MemberAddressService memberAddressService;
    private final MemberService memberService; 
    private final com.cmyk.threeh.service.OrderService orderService;
    
    @Autowired
    private OrderRepository orderRepository;

    //코딩 추가
    //로그인 아이디 꺼내기 공통 메서드(소셜)
    private String getLoginIdOrNull(Principal principal){
        return GetLoginId.getloginId(principal);
    }


    //반품 로직 DB CANCEL
    @PostMapping("/order/cancel")
    @org.springframework.transaction.annotation.Transactional
        public ResponseEntity<String> cancelOrder(
            @RequestParam("orderId") Long orderId,
            @RequestParam("itemId") Long itemId,
            Principal principal) {

                System.out.print("단품 취소 수신(주문: " + orderId + ", 상품: " + itemId + ")");

                String loginId = getLoginIdOrNull(principal);
                if (loginId == null) {
                return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        
          try {
            // 2. 조장님이 주입해 두신 orderService(또는 해당 서비스 객체명)의 cancelOrder 함수를 다이렉트로 가동합니다!
            // 💡 이 코드가 가동되면 DB에서 해당 상품 한 건이 빠지고, 모든 상품이 다 취소되면 주문 상태가 'CANCEL'로 최종 변경됩니다.
            orderService.cancelOrder(orderId, itemId); 
            
            return ResponseEntity.ok("선택하신 상품의 주문 취소가 완료되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("취소 실패: " + e.getMessage());
        }
    }

    // 마이페이지 홈
    @RequestMapping(value = "mypage.do")
    public ResponseEntity<?> mypage(Principal principal) throws Exception {
        //코딩 추가
        String loginId = getLoginIdOrNull(principal);

        if(loginId==null){
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        Member member = memberService.getUser(loginId);
        
        if (member == null) return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");

        Map<String, Object> responseData = new HashMap<>();
        
        Map<String, Object> memberMap = new HashMap<>();
        //코딩 추가
        memberMap.put("id", member.getId());
        memberMap.put("memberId", member.getMemberId());
        memberMap.put("phone", member.getPhone());
        //기존
        memberMap.put("name", member.getName());
        memberMap.put("email", member.getEmail());

        responseData.put("member", memberMap);

        List<Map<String, Object>> recentOrdersMapList = new ArrayList<>();
        if (member.getOrdersList() != null) {
            for (Orders order : member.getOrdersList()) {
                Map<String, Object> orderMap = new HashMap<>();

                //코딩 추가_오현옥_리뷰쓰기에서 오더상태랑 딜리버리 상태 가져오기.
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("orderState", order.getOrderState() 
                != null ? order.getOrderState().name():"");
                orderMap.put("orderDate", order.getOrderDate());
                orderMap.put("deliveryStatus", order.getDeliveryStatus() !=null ?
                order.getDeliveryStatus().name():"WAITING");
                
                // 코딩 추가: 상품명 추출 로직
                Long itemId = null;
                String itemName = "상품 정보 없음";
                
                // 샘플 이미지 테이블 구현을 위한 단가/수량 기본값 초기화
                int orderPrice = 0;
                int count = 0;
 
                if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                    OrderItem firsOrderItem = order.getOrderItems().get(0);

                    if(firsOrderItem.getItem() != null){
                        itemId = firsOrderItem.getItem().getItemId();
                        itemName = firsOrderItem.getItem().getItemName();
                        
                        // 장바구니에서 사용했던 변수명 규칙(orderPrice, count) 그대로 맵에 주입
                        // 장바구니 연동 구조와 일치시켜 리액트에서 단가 및 수량, 소계금액을 바로 계산할 수 있게 토스합니다.
                        orderPrice = firsOrderItem.getOrderPrice(); 
                        count = firsOrderItem.getCount();
                    }
                }

                orderMap.put("itemId", itemId);
                orderMap.put("itemName", itemName);
                orderMap.put("orderPrice", orderPrice); // 판매단가 추가토스
                orderMap.put("count", count);           // 수량 추가토스
                
                recentOrdersMapList.add(orderMap);
            }
        }
        responseData.put("recentOrders", recentOrdersMapList);
        return ResponseEntity.ok(responseData);
    }

    // 마이페이지 배송 현황 스케줄 경로 매핑
    @GetMapping("/mypage/schedule")
    public ResponseEntity<?> getSchedule(Principal principal) {
        //코딩 추가
        String loginId = getLoginIdOrNull(principal);
        
        if(loginId == null){
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        Member member = memberService.getUser(loginId);
        if (member == null) return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");

        List<Map<String, Object>> list = new ArrayList<>();
        return ResponseEntity.ok(list);
    }

    // 결제 내역/주문 조회
    @GetMapping("/order/list")
    public ResponseEntity<?> getOrderList(Principal principal) {
        //코딩 추가
        String loginId = getLoginIdOrNull(principal);
        
        if(loginId == null){
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        
        Member member = memberService.getUser(loginId);
        if (member == null) return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");

        List<Map<String, Object>> ordersList = new ArrayList<>();

        //코딩추가
        if (member.getOrdersList() != null) {
            for (Orders order : member.getOrdersList()) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("orderState", order.getOrderState() != null ? order.getOrderState().name() : "");
                orderMap.put("deliveryStatus", order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : "WAITING");
                ordersList.add(orderMap);
            }
        }
        return ResponseEntity.ok(ordersList);
    }

    //코딩 추가
    //교환/반품 목록 조회
    @GetMapping("/order/refund-list")
    public ResponseEntity<?> getRefundList(Principal principal){
        String loginId = getLoginIdOrNull(principal);

        if (loginId == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        Member member = memberService.getUser(loginId);
        if (member == null) {
            return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");
        }

        List<Map<String, Object>> refundList = new ArrayList<>();
        if (member.getOrdersList() != null) {
            for (Orders order : member.getOrdersList()) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("orderState", order.getOrderState() != null ? order.getOrderState().name() : "");
                orderMap.put("status", order.getOrderState() != null ? order.getOrderState().name() : "");
                orderMap.put("deliveryStatus", order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : "WAITING");
                orderMap.put("orderDate", order.getOrderDate());
                refundList.add(orderMap);
            }
        }
        return ResponseEntity.ok(refundList);
    }

    //구매확정_코딩추가
    @PostMapping("/purchase/confirm")
    @Transactional
    public ResponseEntity<String> confResponseEntity(
        @RequestParam("orderId") Long orderId, Principal principal) 
        {
            String loginId = getLoginIdOrNull(principal);

            if (loginId == null) {
                return ResponseEntity.status(401).body("로그인이 필요합니다.");
            }

            Orders order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
            
            if(order.getOrderState() == OrderState.CANCEL){
                return ResponseEntity.badRequest().body("취소된 주문은 구매확정할 수 없습니다.");
            }

            if(order.getOrderState() == OrderState.PURCHASED){
                return ResponseEntity.badRequest().body("이미 구매확정된 주문입니다.");
            }

            if(order.getOrderState() != OrderState.READY){
                return ResponseEntity.badRequest().body("배송 준비중 상태의 주문만 구매확정 할 수 있습니다.");
            }

            if(order.getDeliveryStatus()==null|| !"COMPLETED".equals(order.getDeliveryStatus().name())){
                return ResponseEntity.badRequest().body("배송완료된 주문만 구매확정 할 수 있습니다.");
            }

            // 끊겼던 구매확정 최종 저장 및 응답 로직 처리 마감
            order.changeOrderState(OrderState.PURCHASED);
            orderRepository.save(order);
            return ResponseEntity.ok("구매확정이 완료되었습니다.");
        }

    /**
     * 교환 신청 처리 API
     * 리액트의 handleExchange 함수가 요청하는 '@PostMapping("/Member/exchange/process")' 주소 매핑
     */
   @PostMapping("/exchange/process")
    @Transactional
    public ResponseEntity<String> processExchange(
            @RequestParam("orderId") Long orderId, Principal principal) {
        
        String loginId = getLoginIdOrNull(principal);
        if (loginId == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");

        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        order.changeOrderState(OrderState.EXCHANGEorREFUND);
        order.changeDeliveryStatus(com.cmyk.threeh.enums.DeliveryStatus.PICKUP);
        
        orderRepository.save(order);
        
        // [핵심 해결 키포인트]: 변경된 상태값을 DB 주차장에 즉시 칼같이 박아넣도록 강제 덤프 처리
        orderRepository.flush(); 

        return ResponseEntity.ok("교환 접수가 완료되었습니다.");
    }

    /**
     * 2반품 접수(구매 취소) 처리 API
     * 리액트의 handleRefund 함수가 요청하는 '@PostMapping("/Member/refund/process")' 주소 매핑
     */
    @PostMapping("/refund/process")
    @Transactional
    public ResponseEntity<String> processRefund(
            @RequestParam("orderId") Long orderId, Principal principal) {
        
        String loginId = getLoginIdOrNull(principal);
        if (loginId == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");

        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        // 고유 CANCEL 스펙
        order.changeOrderState(OrderState.CANCEL);
        
        orderRepository.save(order);
        
        // [핵심 해결 키포인트]: 메모리 들러붙음 현상을 깨부수고 DB 디스크로 데이터 다이렉트 투과!
        orderRepository.flush(); 

        return ResponseEntity.ok("주문 취소가 완료되었습니다.");
    }

    /**
     * 탭 1용 API : 신청 가능한 주문 내역만 필터링 조회 (단가, 수량 완벽 결합)
     * - 이미 교환/반품 중이거나 취소된 건을 제외하고, '신청하기' 단계로 진입할 수 있는 리스트만 내려줍니다.
     */
    @GetMapping("/order/available-refund")
    public ResponseEntity<?> getAvailableRefundList(Principal principal) {
        String loginId = getLoginIdOrNull(principal);
        if (loginId == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");

        Member member = memberService.getUser(loginId);
        if (member == null) return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");

        List<Map<String, Object>> resultList = new ArrayList<>();
        if (member.getOrdersList() != null) {
            for (Orders order : member.getOrdersList()) {
                // 이미 CANCEL이거나 EXCHANGEorREFUND인 상태는 원천 배제
                if (order.getOrderState() == OrderState.CANCEL || order.getOrderState() == OrderState.EXCHANGEorREFUND) {
                    continue;
                }
                
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("orderState", order.getOrderState() != null ? order.getOrderState().name() : "");
                orderMap.put("deliveryStatus", order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : "WAITING");
                orderMap.put("orderDate", order.getOrderDate());
                
                String itemName = "상품 정보 없음";
                Long itemId = null;
                int orderPrice = 0;
                int count = 0;
                
                if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                    OrderItem firstItem = order.getOrderItems().get(0);
                    if (firstItem.getItem() != null) {
                        itemId = firstItem.getItem().getItemId();
                        itemName = firstItem.getItem().getItemName();
                        orderPrice = firstItem.getOrderPrice();
                        count = firstItem.getCount();
                    }
                }
                orderMap.put("itemId", itemId);
                orderMap.put("itemName", itemName);
                orderMap.put("orderPrice", orderPrice);
                orderMap.put("count", count);
                
                resultList.add(orderMap);
            }
        }
        return ResponseEntity.ok(resultList);
    }

    /**
     * 탭 2용 API : 취소처리 현황 목록 조회
     * - 오직 주문 상태가 'CANCEL'인 내역만 명확하게 긁어모아 취소 리스트를 구성합니다.
     */
    @GetMapping("/order/cancel-status-list")
    public ResponseEntity<?> getCancelStatusList(Principal principal) {
        String loginId = getLoginIdOrNull(principal);
        if (loginId == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");

        Member member = memberService.getUser(loginId);
        if (member == null) return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");

        List<Map<String, Object>> cancelList = new ArrayList<>();
        if (member.getOrdersList() != null) {
            for (Orders order : member.getOrdersList()) {
                if (order.getOrderState() == OrderState.CANCEL) {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("orderId", order.getOrderId());
                    orderMap.put("orderState", "CANCEL");
                    orderMap.put("orderDate", order.getOrderDate());
                    
                    String itemName = "상품 정보 없음";
                    int orderPrice = 0;
                    int count = 0;
                    
                    if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                        OrderItem firstItem = order.getOrderItems().get(0);
                        if (firstItem.getItem() != null) {
                            itemName = firstItem.getItem().getItemName();
                            orderPrice = firstItem.getOrderPrice();
                            count = firstItem.getCount();
                        }
                    }
                    orderMap.put("itemName", itemName);
                    orderMap.put("orderPrice", orderPrice);
                    orderMap.put("count", count);
                    
                    cancelList.add(orderMap);
                }
            }
        }
        return ResponseEntity.ok(cancelList);
    }

    /**
     * 탭 3용 API : 반품/교환처리 현황 목록 조회
     * - 현재 교환 및 반품이 진행 중인(EXCHANGEorREFUND) 실시간 상태값만 모아서 전송합니다.
     */
       /**
     * 반품/교환처리 현황 통합 목록 조회 API
     * 부조장님 기획 반영: 이제 반품(CANCEL) 완료건과 교환(EXCHANGEorREFUND) 접수건이 
     * 한 공간에 아름답게 수집되어 리액트의 2번 현황판 탭에 실시간으로 새로 추가되어 나타납니다!
     */
    @GetMapping("/order/exchange-status-list")
    public ResponseEntity<?> getExchangeStatusList(Principal principal) {
        String loginId = getLoginIdOrNull(principal);
        if (loginId == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");

        Member member = memberService.getUser(loginId);
        if (member == null) return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");

        List<Map<String, Object>> exchangeList = new ArrayList<>();
        if (member.getOrdersList() != null) {
            for (Orders order : member.getOrdersList()) {
                
                // [핵심 해결 지점]: 기획 변경에 맞춰 CANCEL(반품) 상태와 EXCHANGEorREFUND(교환) 상태를 모두 수용하도록 통합!
                if (order.getOrderState() == OrderState.CANCEL || order.getOrderState() == OrderState.EXCHANGEorREFUND) {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("orderId", order.getOrderId());
                    
                    // 리액트 삼항연산자 조건문과 매핑되도록 엔티티의 실제 영문 상태명을 안전하게 주입
                    orderMap.put("orderState", order.getOrderState().name());
                    orderMap.put("deliveryStatus", order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : "PICKUP");
                    orderMap.put("orderDate", order.getOrderDate());
                    
                    String itemName = "상품 정보 없음";
                    int orderPrice = 0;
                    int count = 0;
                    
                    if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                        OrderItem firstItem = order.getOrderItems().get(0);
                        if (firstItem.getItem() != null) {
                            itemName = firstItem.getItem().getItemName();
                            orderPrice = firstItem.getOrderPrice();
                            count = firstItem.getCount();
                        }
                    }
                    orderMap.put("itemName", itemName);
                    orderMap.put("orderPrice", orderPrice);
                    orderMap.put("count", count);
                    
                    exchangeList.add(orderMap);
                }
            }
        }
        return ResponseEntity.ok(exchangeList);
    }

    }