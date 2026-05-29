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


            // =========================================================================
        // 🚀 [인호 백엔드 진짜 최종 완결]: findByMemberId 규격 일치화 및 DB 강제 반영
        // =========================================================================
        @PostMapping("/order/cancel")
        @org.springframework.transaction.annotation.Transactional // 💡 영속성 실시간 DB 반영을 위한 트랜잭션 각인
        public ResponseEntity<String> cancelOrder(
                @RequestParam("orderId") Long orderId, 
                @RequestParam("itemId") Long itemId, 
                Principal principal) {
            
            System.out.println("=== [주문 취소 강제 주입 API] 주문: " + orderId + " | 상품: " + itemId + " ===");
            
            String loginId = getLoginIdOrNull(principal);
            if (loginId == null) {
                return ResponseEntity.status(401).body("로그인이 필요합니다.");
            }

            try {
                // 1. 조장님의 정교한 단품 취소 서비스 로직을 그대로 먼저 가동시킵니다.
                // (내부적으로 수량 원복 addStock 가동)
                orderService.cancelOrder(orderId, itemId);
                
                // 2. 🚨 [JPA 족쇄 해제 및 DB 반영 강제 보장]: 
                // 조장님 레포지토리 실제 규격 명세에 맞춰 주문 영속 객체를 명확하게 다시 로드합니다.
                Orders order = orderRepository.findById(orderId).orElse(null);
                if (order != null) {
                    // 부모 주문 상태를 강제로 대문자 CANCEL로 확실히 낙인찍어 줍니다.
                    order.setOrderState(com.cmyk.threeh.enums.OrderState.CANCEL);
                    
                    // 3. 🚀 영속성 쿼리 유실 현상을 방지하기 위해 saveAndFlush를 사용하여 
                    // 실제 오라클 DB 테이블 레코드 컬럼에 'CANCEL' 문자열을 강제로 밀어 넣고 즉시 커밋시킵니다!
                    orderRepository.saveAndFlush(order); 
                    System.out.println(">>> [오라클 DB 테이블 영구 커밋 성공] order_state가 CANCEL로 저장되었습니다.");
                }
                
                return ResponseEntity.ok("주문 취소가 정상적으로 처리되었습니다.");
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.badRequest().body("취소 처리 실패: " + e.getMessage());
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

                        // 김승우 수정
                        for(OrderItem orderItem : order.getOrderItems()){

                            if(orderItem.getItem() != null) {
                                Map<String, Object> itemMap = new HashMap<>();
                                
                                itemMap.put("itemId", orderItem.getItem().getItemId());
                                itemMap.put("itemName", orderItem.getItem().getItemName());
                                itemMap.put("orderDate", order.getOrderDate());
                                itemMap.put("orderId", order.getOrderId());
                                itemMap.put("orderPrice", orderItem.getItem().getItemPrice());
                                itemMap.put("count", orderItem.getCount());
                                itemMap.put("orderState", order.getOrderState());
                                itemMap.put("deliveryStatus", order.getDeliveryStatus());
                                
                                recentOrdersMapList.add(itemMap);// 
                            }
                        }

                        // if(firsOrderItem.getItem() != null){
                        //     itemId = firsOrderItem.getItem().getItemId();
                        //     itemName = firsOrderItem.getItem().getItemName();
                            
                        //     // 장바구니에서 사용했던 변수명 규칙(orderPrice, count) 그대로 맵에 주입
                        //     // 장바구니 연동 구조와 일치시켜 리액트에서 단가 및 수량, 소계금액을 바로 계산할 수 있게 토스합니다.
                        //     orderPrice = firsOrderItem.getOrderPrice(); 
                        //     count = firsOrderItem.getCount();
                        // }
                    }

                    
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

            // =========================================================================
        // 🚀 [인호 백엔드 최종 완결판]: 잭슨 누수 현상을 깨부수고 상품명 강제 각인 완료
        // =========================================================================
        @GetMapping("/order/list")
        @org.springframework.transaction.annotation.Transactional(readOnly = true) // 💡 영속성 데이터 안전 가동을 위한 트랜잭션 각인
        public ResponseEntity<?> getOrderList(Principal principal) {
            // 코딩 추가
            String loginId = getLoginIdOrNull(principal);
            
            if (loginId == null) {
                return ResponseEntity.status(401).body("로그인이 필요합니다.");
            }
            
            Member member = memberService.getUser(loginId);
            if (member == null) {
                return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");
            }

            List<Map<String, Object>> ordersList = new ArrayList<>();

            // 코딩 추가
            if (member.getOrdersList() != null) {
                for (Orders order : member.getOrdersList()) {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("orderId", order.getOrderId());
                    orderMap.put("orderState", order.getOrderState() != null ? order.getOrderState().name() : "");
                    orderMap.put("deliveryStatus", order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : "WAITING");
                    
                    // 🚨 [가장 중요한 상품명 공백 박멸 핵심 구역]
                    // 지연 로딩이나 @JsonIgnore에 구애받지 않도록 자바 반복문 내부에서 
                    // 해당 주문의 실제 자식 아이템 리스트를 강제로 호출하여 알맹이 데이터를 가방에 주입합니다.
                    List<Map<String, Object>> itemsArray = new ArrayList<>();
                    if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                        for (OrderItem oi : order.getOrderItems()) {
                            Map<String, Object> itemMap = new HashMap<>();
                            itemMap.put("orderItemId", oi.getOrderItemId());
                            itemMap.put("count", oi.getCount());
                            itemMap.put("orderPrice", oi.getOrderPrice());
                            
                            // 조장님 ManyToOne 관계인 Item을 관통하여 실제 DB 속에 박힌 가구 이름 텍스트 강제 획득
                            if (oi.getItem() != null) {
                                itemMap.put("itemId", oi.getItem().getItemId());
                                // 🚀 리액트 Refund.js가 목놓아 기다리던 'itemName' 방안에 진짜 가구 이름 글자를 주입합니다!
                                itemMap.put("itemName", oi.getItem().getItemName()); 
                            } else {
                                itemMap.put("itemName", "세트 구성 가구 상품");
                            }
                            itemsArray.add(itemMap);
                        }
                    }
                    
                    // 완성형 자식 배열을 부모 orderItems 이름표로 결합하여 리액트에 토스!
                    orderMap.put("orderItems", itemsArray);
                    ordersList.add(orderMap);
                }
            }
            
            System.out.println(">>> [인호 백엔드 마감] 총 " + ordersList.size() + "건의 주문 상세 데이터를 유실 없이 안전하게 전송합니다.");
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
                
                // 만약 마이페이지 메인 구매내역 창이라면 취소된 건뿐만 아니라 
                // 정상 주문(ORDER, PURCHASED 등)도 다 봐야 하므로 아래 조건문을 프로젝트 기획에 맞게 조율해 주세요.
                if (order.getOrderState() == OrderState.CANCEL) {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("orderId", order.getOrderId());
                    orderMap.put("orderState", "CANCEL");
                    orderMap.put("orderDate", order.getOrderDate());
                    
                    String productName = "상품 정보 없음"; // 리액트 변수명({order.productName})과 일치시킴
                    int totalCount = 0;
                    
                    if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                        // 1. 대표 상품명 설정 (첫 번째 상품명)
                        OrderItem firstItem = order.getOrderItems().get(0);
                        if (firstItem.getItem() != null) {
                            productName = firstItem.getItem().getItemName();
                        }
                        
                        // 2. 상품이 여러 개라면 "X 상품 외 X건" 형태로 네이밍 가공 (1개만 뜨는 문제 해결)
                        if (order.getOrderItems().size() > 1) {
                            productName = productName + " 외 " + (order.getOrderItems().size() - 1) + "건";
                        }
                        
                        // 수량 총합 계산
                        for (OrderItem item : order.getOrderItems()) {
                            totalCount += item.getCount();
                        }
                    }
                    
                    // 3. [조장님 엔티티 메서드 활용]: 단일 상품 단가가 아닌 10개 상품의 총 누적 합산 금액 추출
                    int totalOrderPrice = order.getTotalPrice();
                    
                    orderMap.put("productName", productName); 
                    orderMap.put("orderPrice", totalOrderPrice); // 리액트 {order.orderPrice}와 매핑
                    orderMap.put("count", totalCount);
                    
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
                
                // 1. [핵심 수정]: 특정 상태만 거르는 IF 조건문을 과감히 제거합니다!
                // 이렇게 해야 방금 주문한 'ORDER' 상태의 최신 주문 데이터도 유실 없이 리스트에 담깁니다.
                
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("orderState", order.getOrderState().name());
                
                // 조장님 엔티티에 있는 getTotalStatus() 메서드를 활용해 안전하게 배송 상태 추출
                orderMap.put("deliveryStatus", order.getTotalStatus() != null ? order.getTotalStatus().name() : "WAITING");
                orderMap.put("orderDate", order.getOrderDate());
                
                String productName = "상품 정보 없음"; 
                
                if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                    // 대표 상품명 설정 (첫 번째 상품명)
                    OrderItem firstItem = order.getOrderItems().get(0);
                    if (firstItem.getItem() != null) {
                        productName = firstItem.getItem().getItemName();
                    }
                    
                    // 한 주문 안에 상품 종류가 여러 개라면 "외 X건" 가공
                    if (order.getOrderItems().size() > 1) {
                        productName = productName + " 외 " + (order.getOrderItems().size() - 1) + "건";
                    }
                }
                
                // [조장님 엔티티 메서드 활용]: 직접 로직을 짤 필요 없이 조장님이 만든 getTotalPrice()를 호출하면
                // 한 주문 안에 담긴 10개의 묶음 상품 금액이 완벽하게 합산됩니다.
                int totalOrderPrice = order.getTotalPrice();
                
                orderMap.put("productName", productName); 
                orderMap.put("orderPrice", totalOrderPrice);
                orderMap.put("count", order.getOrderItems() != null ? order.getOrderItems().size() : 0);
                
                exchangeList.add(orderMap);
            }
        }

            return ResponseEntity.ok(exchangeList);
        }

    }
