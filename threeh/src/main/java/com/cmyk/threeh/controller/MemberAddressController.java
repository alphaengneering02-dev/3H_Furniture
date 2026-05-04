package com.cmyk.threeh.controller;

import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.cmyk.threeh.form.MemberAddressForm;
import com.cmyk.threeh.service.MemberAddressService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/Member")
public class MemberAddressController {

    private final MemberAddressService memberAddressService;

    // 배송지 목록 조회
    @GetMapping("/list")
    public String addressList(HttpSession session, Model model) {
        String userid = (String) session.getAttribute("userid");
        if(userid == null) userid = "testuser01"; 

        model.addAttribute("addressList", memberAddressService.getAddressList(userid));
        return "mypage/address_list";
    }

    // 배송지 추가
    @PostMapping("/add")
    public String addAddress(@Valid MemberAddressForm memberAddressForm,
                            BindingResult bindingResult,
                            HttpSession session) {

        if(bindingResult.hasErrors()) {
            return "mypage/address_form";
        }

        String userid = (String) session.getAttribute("userid");
        if(userid == null) userid = "testuser01";
        
        memberAddressService.saveAddress(userid, memberAddressForm);
        return "redirect:/Member/list";
    }

    // 주문 상세
    @GetMapping("/orderDetail")
    public String oderDetail(@RequestParam("orderId") Long orderId, Model model) {
        model.addAttribute("deliveryInfo", memberAddressService.getOrderDeliveryInfo(orderId));
        return "mypage/order_detail";
    }
    
    // 마이페이지 메인
    @RequestMapping(value = "mypage.do")
    public String mypage() throws Exception {
        return "member/mypage";
    }

    // 환불/삭제 요청
    @PostMapping("/refund")
    public String refundRequest(@RequestParam("orderId") Long orderId) {
        // 서비스 내부에서 3일 체크 -> (지났으면) 삭제 / (안지났으면) 환불상태변경 처리함.
        memberAddressService.processRefundOrDelete(orderId);
        
        return "redirect:/Member/mypage.do";
    }
}
    
    
