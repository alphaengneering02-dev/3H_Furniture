package com.cmyk.threeh.controller;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

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
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.repository.OrderRepository;
import com.cmyk.threeh.service.MemberAddressService;
import com.cmyk.threeh.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/Member")
public class MemberAddressController {

    private final MemberAddressService memberAddressService;
    private final MemberService memberService; 
    
    @Autowired
    private OrderRepository orderRepository;

    // 마이페이지 홈
    @RequestMapping(value = "mypage.do")
    public ResponseEntity<?> mypage(Principal principal) throws Exception {
        String userid = (principal != null) ? principal.getName() : "user";
        Member member = memberService.getUser(userid);
        
        if (member == null) return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");

        Map<String, Object> responseData = new HashMap<>();
        
        Map<String, Object> memberMap = new HashMap<>();
        memberMap.put("name", member.getName());
        memberMap.put("email", member.getEmail());
        responseData.put("member", memberMap);

        List<Map<String, Object>> recentOrdersMapList = new ArrayList<>();
        if (member.getOrdersList() != null) {
            for (Orders order : member.getOrdersList()) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("orderState", order.getOrderState());
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
        String userid = (principal != null) ? principal.getName() : "user";
        Member member = memberService.getUser(userid);
        if (member == null) return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");

        List<Map<String, Object>> list = new ArrayList<>();
        for (Orders order : member.getOrdersList()) {
            Map<String, Object> map = new HashMap<>();
            map.put("orderId", order.getOrderId());
            map.put("deliveryStatus", order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : "배송준비중");
            list.add(map);
        }
        return ResponseEntity.ok(list);
    }

    // 결제 내역/주문 조회
    @GetMapping("/order/list")
    public ResponseEntity<?> getOrderList(Principal principal) {
        String userid = (principal != null) ? principal.getName() : "user";
        Member member = memberService.getUser(userid);
        if (member == null) return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");

        List<Map<String, Object>> ordersList = new ArrayList<>();
        for (Orders order : member.getOrdersList()) {
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("orderId", order.getOrderId());
            orderMap.put("orderState", order.getOrderState().name());
            orderMap.put("deliveryStatus", order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : "WAITING");
            ordersList.add(orderMap);
        }
        return ResponseEntity.ok(ordersList);
    }

    // 나머지 기존 메서드들 유지 (생략된 부분은 그대로 두시면 됩니다)
    @PostMapping("/purchase/confirm")
    @Transactional
    public ResponseEntity<String> confResponseEntity(@RequestParam("orderId") Long orderId) {
        Orders order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        order.setOrderState(OrderState.PURCHASED);
        return ResponseEntity.ok("구매가 확정되었습니다");
    }

    // [이하 기존 refund, delete, address 등 동일하게 유지]
}