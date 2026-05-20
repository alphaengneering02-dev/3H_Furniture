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

                orderMap.put("orderId", order.getOrderId());
                
                // 코딩 추가_오현옥: 상품명 추출 로직
                String itemName = "상품 정보 없음";
                if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                    itemName = order.getOrderItems().get(0).getItem().getItemName();
                }
                orderMap.put("itemName", itemName);

                //코딩 추가_오현옥
                orderMap.put("orderState", order.getOrderState() !=null ? order.getOrderState().name():"");
                orderMap.put("deliveryStatus", order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : "대기중");
                
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
                refundList.add(orderMap);
            }
        }
        return ResponseEntity.ok(refundList);
    }

    //구매확정_코딩추가
    @PostMapping("/purchase/confirm")
    @Transactional
    public ResponseEntity<String> confResponseEntity(@RequestParam("orderId") Long orderId, Principal principal) {
        String loginId = getLoginIdOrNull(principal);
        if (loginId == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        Orders order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        order.setOrderState(OrderState.PURCHASED);
        return ResponseEntity.ok("구매가 확정되었습니다");
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