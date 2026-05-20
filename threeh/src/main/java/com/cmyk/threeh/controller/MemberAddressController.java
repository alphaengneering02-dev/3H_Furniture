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
    
    @Autowired
    private OrderRepository orderRepository;

    //코딩 추가_오현옥
    //로그인 아이디 꺼내기 공통 메서드(소셜)
    private String getLoginIdOrNull(Principal principal){
        return GetLoginId.getloginId(principal);
    }

    // 마이페이지 홈
    @RequestMapping(value = "mypage.do")
    public ResponseEntity<?> mypage(Principal principal) throws Exception {
        //코딩 추가_오현옥
        String loginId = getLoginIdOrNull(principal);

        if(loginId==null){
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        Member member = memberService.getUser(loginId);
        
        if (member == null) return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");

        Map<String, Object> responseData = new HashMap<>();
        
        Map<String, Object> memberMap = new HashMap<>();
        //코딩 추가_오현옥
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
                
                // 코딩 추가_오현옥: 상품명 추출 로직
                Long itemId = null;
                String itemName = "상품 정보 없음";
 
                if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                    OrderItem firsOrderItem = order.getOrderItems().get(0);

                    if(firsOrderItem.getItem() != null){
                        itemId = firsOrderItem.getItem().getItemId();
                        itemName = firsOrderItem.getItem().getItemName();
                    }
                }

                orderMap.put("itemId", itemId);
                orderMap.put("itemName", itemName);
                
                recentOrdersMapList.add(orderMap);
            }
        }
        responseData.put("recentOrders", recentOrdersMapList);
        return ResponseEntity.ok(responseData);
    }

    // 마이페이지 배송 현황 스케줄 경로 매핑
    @GetMapping("/mypage/schedule")
    public ResponseEntity<?> getSchedule(Principal principal) {
        //코딩 추가_오현옥
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
        //코딩 추가_오현옥
        String loginId = getLoginIdOrNull(principal);
        
        if(loginId == null){
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        
        Member member = memberService.getUser(loginId);
        if (member == null) return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");

        List<Map<String, Object>> ordersList = new ArrayList<>();

        //코딩추가_오현옥
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

    //코딩 추가_오현옥 
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

    //구매확정_코딩추가_오현옥
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

            order.setOrderState(OrderState.PURCHASED);

            return ResponseEntity.ok("구매가 확정되었습니다.");
        }

    // 반품 처리_코딩추가
    @PostMapping("/refund/process")
    @Transactional
    public ResponseEntity<String> refundProcess(@RequestParam("orderId") Long orderId, Principal principal) {
        String loginId = getLoginIdOrNull(principal);
        if (loginId == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        Orders order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        order.setOrderState(OrderState.CANCEL);
        return ResponseEntity.ok("주문번호 " + orderId + "번 반품 처리가 완료되었습니다.");
    }
}