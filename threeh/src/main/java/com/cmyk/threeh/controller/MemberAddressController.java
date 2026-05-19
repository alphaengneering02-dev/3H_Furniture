package com.cmyk.threeh.controller;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.service.MemberAddressService;
import com.cmyk.threeh.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/Member")
public class MemberAddressController {

    //@Resource
    private final MemberAddressService memberAddressService;
    private final MemberService memberService; 

    //마이페이지 홈
    @RequestMapping(value = "mypage.do")
    public ResponseEntity<?> mypage(Principal principal) throws Exception {
        String userid = (principal != null) ? principal.getName() : "user";
        Member member = memberService.getUser(userid);
        
        if (member == null) {
            return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");
        }

        Map<String, Object> responseData = new HashMap<>();
        
        // [오류 수정 포인트 1] Member 엔티티 내부의 순수 텍스트 필드만 Map으로 가공하여 무한 루프 진입 차단
        Map<String, Object> memberMap = new HashMap<>();
        memberMap.put("memberId", member.getMemberId());
        memberMap.put("id", member.getId());
        memberMap.put("name", member.getName());
        memberMap.put("email", member.getEmail());
        memberMap.put("phone", member.getPhone());
        memberMap.put("role", member.getRole());
        memberMap.put("regNo", member.getRegNo());
        responseData.put("member", memberMap);

        // [오류 수정 포인트 2] 최근 주문 엔티티 내의 Member 순환 참조 차단을 위한 맵 변환
        List<Map<String, Object>> recentOrdersMapList = new ArrayList<>();
        if (member.getOrdersList() != null) {
            for (Orders order : member.getOrdersList()) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("deliveryAddr", order.getDeliveryAddr());
                orderMap.put("deliveryAddrDetail", order.getDeliveryAddrDetail());
                orderMap.put("orderDate", order.getOrderDate());
                orderMap.put("orderState", order.getOrderState());
                orderMap.put("orderType", order.getOrderType());
                orderMap.put("installDate", order.getInstallDate());
                orderMap.put("deliveryDate", order.getDeliveryDate());
                orderMap.put("requestTime", order.getRequestTime());
                orderMap.put("requestMessage", order.getRequestMessage());
                orderMap.put("totalPrice", order.getTotalPrice());
                orderMap.put("totalStatus", order.getTotalStatus());
                recentOrdersMapList.add(orderMap);
            }
        }
        responseData.put("recentOrders", recentOrdersMapList);
        
        return ResponseEntity.ok(responseData);
    }

    //고객 배송/설치 시간 내역
    @GetMapping("/delivery/schedule")
    public ResponseEntity<String> deliverySchedule() {
        return ResponseEntity.ok("배송 및 설치 일정 조회가 성공했습니다.");
    }

    //회원탈퇴
    @PostMapping("/delete")
    public ResponseEntity<String> deleteMember(Principal principal) {
        try {
            String userid = (principal != null) ? principal.getName() : null;

            if(userid == null) {
                return ResponseEntity.status(401).body("로그인이 필요합니다.");
            }
            memberService.delete(userid);

            return ResponseEntity.ok("탈퇴가 정상적으로 처리되었습니다");
        }catch (Exception e) {
            return ResponseEntity.status(500).body("탈퇴 처리 중 오류 발생:" + e.getMessage());
        }
    }

    //교환 및 반품 목록 조회
    @GetMapping("/order/refund-list")
    public ResponseEntity<?> refundList(Principal principal) {
        String userid = (principal != null) ? principal.getName() : "user";
        Member member = memberService.getUser(userid);
        
        if (member == null) {
            return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");
        }

        // [오류 수정 포인트 3] 반환형 List<Orders> 엔티티 내에 박힌 Member 연쇄 참조 오류 완전 차단
        List<Map<String, Object>> refundMapList = new ArrayList<>();
        if (member.getOrdersList() != null) {
            for (Orders order : member.getOrdersList()) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("deliveryAddr", order.getDeliveryAddr());
                orderMap.put("deliveryAddrDetail", order.getDeliveryAddrDetail());
                orderMap.put("orderDate", order.getOrderDate());
                orderMap.put("orderState", order.getOrderState());
                orderMap.put("orderType", order.getOrderType());
                orderMap.put("installDate", order.getInstallDate());
                orderMap.put("deliveryDate", order.getDeliveryDate());
                orderMap.put("requestTime", order.getRequestTime());
                orderMap.put("requestMessage", order.getRequestMessage());
                orderMap.put("totalPrice", order.getTotalPrice());
                orderMap.put("totalStatus", order.getTotalStatus());
                refundMapList.add(orderMap);
            }
        }
        return ResponseEntity.ok(refundMapList);
    }

    //구매내역 전체 조회
    @GetMapping("/order/history")
    public ResponseEntity<String> orderHistory() {
        return ResponseEntity.ok("구매 내역 조회가 성공했습니다.");
    }

    //배송지 관리 메뉴
    @GetMapping("/address/list")
    public ResponseEntity<?> addressList(Principal principal) {
        String userid = (principal != null) ? principal.getName() : "user";
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("addressList", memberAddressService.getAddressList(userid));
        
        try {
            memberAddressService.getDefaultAddressForOrder(userid);
            responseData.put("msg", "기본 배송지가 등록되어 있습니다.");
        } catch (NoSuchElementException e) {
            responseData.put("msg", e.getLocalizedMessage());
        }
        
        return ResponseEntity.ok(responseData);
    }

    //[중요] 교환/반품 버튼 클릭 시 실행 (강제 삭제 및 재고 복구)
    @PostMapping("/refund/process")
    public ResponseEntity<String> refundRequest(@RequestParam("orderId") Long orderId) {
        try {
            // Service에 있는 즉시 삭제 기능을 호출합니다.
            memberAddressService.deleteOrderForce(orderId);
            return ResponseEntity.ok("주문번호 " + orderId + "번 처리가 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("처리 중 오류 발생: " + e.getMessage());
        }
    }

    //[중요] 3일 시간제한 자동삭제/취소 로직 (시스템 호출용)
    @PostMapping("/refund/auto-check")
    public ResponseEntity<String> autoRefundCheck(@RequestParam("orderId") Long orderId) {
        try {
            // Service에 있는 3일 제한 로직(processRefundOrDelete)을 호출합니다.
            memberAddressService.processRefundOrDelete(orderId);
            return ResponseEntity.ok("주문번호 " + orderId + "번의 3일 자동 상태 체크가 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("자동 처리 중 오류 발생: " + e.getMessage());
        }
    }
}
