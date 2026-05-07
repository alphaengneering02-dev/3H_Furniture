package com.cmyk.threeh.controller;

import java.security.Principal;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.service.MemberAddressService;
import com.cmyk.threeh.service.MemberService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/Member")
public class MemberAddressController {

    private final MemberAddressService memberAddressService;
    private final MemberService memberService; // [연동]: 태양님 멤버 서비스

    
    //마이페이지 홈
    //중앙 영역에 '회원 정보'와 '최근 주문내역'을 출력
    @RequestMapping(value = "mypage.do")
    public String mypage(Principal principal, Model model) throws Exception {
        // 시큐리티를 통해 로그인한 사용자 정보 가져오기
        String userid = (principal != null) ? principal.getName() : "testuser01";
        Member member = memberService.getUser(userid);
        
        // 회원 정보(이름, 이메일, 전화번호 등)를 모델에 담기
        model.addAttribute("member", member);
        
        // 조장님 연동 - 최근 주문 내역(ordersList)도 같이 노출
        model.addAttribute("recentOrders", member.getOrdersList());
        
        return "member/mypage"; // 중앙에 회원정보가 나오는 메인 JSP
    }

    
    //고객 배송/설치 시간 내역
    @GetMapping("/delivery/schedule")
    public String deliverySchedule(Principal principal, Model model) {
        // 일정 변경 페이지 이동 로직
        return "mypage/delivery_schedule";
    }

    /**
     * 교환 및 반품
     * 3일 시간제한 로직 적용
     */
    @GetMapping("/order/refund-list")
    public String refundList(Principal principal, Model model) {
        // 3일 체크 로직이 포함된 내역 리스트 페이지 이동
        return "mypage/refund_list";
    }

    
    //구매내역 전체
    @GetMapping("/order/history")
    public String orderHistory(Principal principal, Model model) {
        return "mypage/order_list";
    }

    
    //배송지 관리 메뉴
    @GetMapping("/address/list")
    public String addressList(Principal principal, Model model) {
        String userid = (principal != null) ? principal.getName() : "testuser01";
        model.addAttribute("addressList", memberAddressService.getAddressList(userid));
        
        //기본 주소지 NUll값 알림문
        try {
            memberAddressService.getDefaultAddressForOrder(userid);
        }catch (NoSuchElementException e) {
            model.addAttribute("msg",e.getLocalizedMessage());
        }
        return "mypage/address_list";
    }

    
     //환불 처리 실행
    @PostMapping("/refund/process")
    public String refundRequest(@RequestParam("orderId") Long orderId) {
        // 서비스에서 3일 날짜 계산 후 처리
        memberAddressService.processRefundOrDelete(orderId);
        return "redirect:/Member/mypage.do";
    }
}
