package com.cmyk.threeh.controller;

import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping; 
import org.springframework.web.bind.annotation.RequestMapping;

import com.cmyk.threeh.dto.SessionMember; 
import com.cmyk.threeh.form.CartItemForm;
import com.cmyk.threeh.service.CartItemService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/cartItem")
public class CartItemController {

    private final CartItemService cartItemService;

    @PostMapping("/add") 
    public String addCartItem(@Valid CartItemForm cartItemForm,
                              BindingResult bindingResult,
                              HttpSession session) {

        // 유효성 검사 에러 시 기존 페이지(장바구니)로 리다이렉트
        if(bindingResult.hasErrors()) {
            return "redirect:/mypage/cart";
        }

        // 세션에 담는 키값 "member"로 로그인 여부 확인
        SessionMember member = (SessionMember) session.getAttribute("member");
        
        if(member == null) {
            // 로그인 정보가 없으면 로그인 페이지로 리다이렉트
            return "redirect:/member/login";
        }

        // 서비스 내부에서 세션을 처리하도록 수정했으므로 인자 없이 폼만 전달
        cartItemService.addCartItem(cartItemForm);

        return "redirect:/mypage/cart";
    }
}
