package com.cmyk.threeh.controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController; //RestController 임포트

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.service.MemberAddressService;
import com.cmyk.threeh.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController // JSP 뷰 화면 대신 순수 데이터(JSON)를 리턴하여 리액트와 연동합니다.
@RequiredArgsConstructor
@RequestMapping("/Member")
public class MemberAddressController {

    private final MemberAddressService memberAddressService;
    private final MemberService memberService; // [연동]: 태양님 멤버 서비스

    
    // 마이페이지 홈
    // 중앙 영역에 '회원 정보'와 '최근 주문내역'을 출력
    @RequestMapping(value = "mypage.do")
    public ResponseEntity<?> mypage(Principal principal) throws Exception {
        // 시큐리티를 통해 로그인한 사용자 정보 가져오기
        String userid = (principal != null) ? principal.getName() : "testuser01";
        Member member = memberService.getUser(userid);
        
        if (member == null) {
            return ResponseEntity.status(404).body("회원 정보를 찾을 수 없습니다.");
        }

        // 리액트에서 한 번에 쪼개 쓸 수 있도록 회원 정보와 주문 내역을 Map(상자)에 담아 쏩니다.
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("member", member);
        responseData.put("recentOrders", member.getOrdersList());
        
        return ResponseEntity.ok(responseData);
    }

    
    // 고객 배송/설치 시간 내역
    @GetMapping("/delivery/schedule")
    public ResponseEntity<String> deliverySchedule() {
        // 화면 주소를 리턴하는 대신 성공 신호를 줘서 리액트가 해당 컴포넌트를 띄우게 합니다.
        return ResponseEntity.ok("배송 및 설치 일정 조회가 성공했습니다.");
    }

    /**
     * 교환 및 반품
     * 3일 시간제한 로직 적용
     */
    @GetMapping("/order/refund-list")
    public ResponseEntity<String> refundList() {
        return ResponseEntity.ok("교환 및 반품 내역 조회가 성공했습니다.");
    }

    
    // 구매내역 전체
    @GetMapping("/order/history")
    public ResponseEntity<String> orderHistory() {
        return ResponseEntity.ok("구매 내역 조회가 성공했습니다.");
    }

    
    // 배송지 관리 메뉴
    @GetMapping("/address/list")
    public ResponseEntity<?> addressList(Principal principal) {
        String userid = (principal != null) ? principal.getName() : "testuser01";
        
        Map<String, Object> responseData = new HashMap<>();
        
        // DB에서 긁어온 주소록 데이터를 담습니다.
        responseData.put("addressList", memberAddressService.getAddressList(userid));
        
        // 기본 주소지 Null값 알림문 처리
        try {
            memberAddressService.getDefaultAddressForOrder(userid);
            responseData.put("msg", "기본 배송지가 등록되어 있습니다.");
        } catch (NoSuchElementException e) {
            responseData.put("msg", e.getLocalizedMessage());
        }
        
        return ResponseEntity.ok(responseData);
    }

    
    // 환불 처리 실행
    @PostMapping("/refund/process")
    public ResponseEntity<String> refundRequest(@RequestParam("orderId") Long orderId) {
        try {
            // 서비스에서 3일 날짜 계산 후 처리
            memberAddressService.processRefundOrDelete(orderId);
            return ResponseEntity.ok("주문번호 " + orderId + "번 환불 처리가 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("환불 처리 중 오류 발생: " + e.getMessage());
        }
    }
}
