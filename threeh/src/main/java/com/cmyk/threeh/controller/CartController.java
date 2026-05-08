package com.cmyk.threeh.controller;

import javax.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity; // 추가
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.CartDTO;
import com.cmyk.threeh.dto.SessionMember; 
import com.cmyk.threeh.service.CartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mypage")
public class CartController {

    private final CartService cartService;

    // 장바구니 목록조회
    @GetMapping("/cart")
    public ResponseEntity<?> cartList(HttpSession session) { // Model 삭제, 리턴타입 변경

        SessionMember member = (SessionMember) session.getAttribute("member");

        if(member == null) {
            // 리액트가 인지할 수 있도록 401 에러와 메시지 반환
            return ResponseEntity.status(401).body("로그인이 필요합니다."); 
        }

        CartDTO cartDTO = cartService.getCartDto();
        
        // JSP 파일명 대신, 긁어온 장바구니 데이터를 리액트로 다이렉트 전송
        return ResponseEntity.ok(cartDTO); 
    }

    // 장바구니 상품 삭제
    @PostMapping("/cart/delete/{cartItemId}")
    public ResponseEntity<String> deleteCartItem(@PathVariable Long cartItemId, HttpSession session) {
        
        if(session.getAttribute("member") == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        cartService.deleteCartItem(cartItemId);

        // 리다이렉트 문자열 대신, 성공 메시지 반환
        return ResponseEntity.ok("상품이 삭제되었습니다."); 
    }

    // 장바구니 수량 변경
    @PostMapping("/cart/update")
    public ResponseEntity<String> updateCount(@RequestParam Long cartItemId, @RequestParam int count, HttpSession session) {

        if(session.getAttribute("member") == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        cartService.updateCount(cartItemId, count);

        // 리다이렉트 문자열 대신, 성공 메시지 반환
        return ResponseEntity.ok("수량이 변경되었습니다."); 
    }
}
