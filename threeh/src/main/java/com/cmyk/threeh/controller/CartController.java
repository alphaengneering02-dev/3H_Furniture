package com.cmyk.threeh.controller;

import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.cmyk.threeh.dto.CartDTO;
import com.cmyk.threeh.dto.SessionMember; 
import com.cmyk.threeh.service.CartService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/mypage")
public class CartController {

    private final CartService cartService;

    // 장바구니 목록조회
    @GetMapping("/cart")
    public String cartList(HttpSession session, Model model) {

        // 세션 키값 "member"로 로그인 여부 확인
        SessionMember member = (SessionMember) session.getAttribute("member");

        if(member == null) {
            // 로그인 안 되어 있으면 로그인 페이지로 리다이렉트
            return "redirect:/member/login"; 
        }

        // 서비스 내부에서 세션을 꺼내 쓰도록 수정했으므로 인자 없이 호출
        CartDTO cartDTO = cartService.getCartDto();
        model.addAttribute("cart", cartDTO);

        return "Cart";
    }

    // 장바구니 상품 삭제
    @PostMapping("/cart/delete/{cartItemId}")
    public String deleteCartItem(@PathVariable Long cartItemId, HttpSession session) {
        
        // 권한 체크: 로그인 여부 확인
        if(session.getAttribute("member") == null) return "redirect:/member/login";

        cartService.deleteCartItem(cartItemId);

        return "redirect:/mypage/cart";
    }

    // 장바구니 수량 변경
    @PostMapping("/cart/update")
    public String updateCount(@RequestParam Long cartItemId, @RequestParam int count, HttpSession session) {

        // 권한 체크: 로그인 여부 확인
        if(session.getAttribute("member") == null) return "redirect:/member/login";

        cartService.updateCount(cartItemId, count);

        return "redirect:/mypage/cart";
    }
}
