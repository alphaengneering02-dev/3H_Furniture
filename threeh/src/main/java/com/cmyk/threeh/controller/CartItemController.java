package com.cmyk.threeh.controller;

import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping; 
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.SessionMember; 
import com.cmyk.threeh.form.CartItemForm;
import com.cmyk.threeh.service.CartItemService;

import lombok.RequiredArgsConstructor;

@RestController // 화면 이동 대신 성공/실패 여부를 데이터로 리액트에 리턴합니다.
@RequiredArgsConstructor
@RequestMapping("/cartItem")
public class CartItemController {

    private final CartItemService cartItemService;

    @PostMapping("/add") 
    public ResponseEntity<String> addCartItem(@Valid CartItemForm cartItemForm,
                                              BindingResult bindingResult,
                                              HttpSession session) {

        // 유효성 검사 에러 시 에러 메시지를 리액트에 400 에러로 응답합니다.
        if(bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("입력 형식이 올바르지 않습니다.");
        }

        // 세션에 담는 키값 "member"로 로그인 여부 확인
        SessionMember member = (SessionMember) session.getAttribute("member");
        
        // 로그인 정보가 없으면 401(미인증) 에러를 리액트에 쏴서 로그인 창으로 유도합니다.
        if(member == null) {
            return ResponseEntity.status(401).body("로그인이 필요한 서비스입니다.");
        }

        // 서비스 레이어 호출 (기존에 작성하신 서비스를 그대로 사용합니다.)
        try {
            cartItemService.addCartItem(cartItemForm);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("장바구니 담기 중 오류 발생: " + e.getMessage());
        }

        // 장바구니 담기가 성공하면 리액트가 알 수 있도록 200 OK와 성공 메시지를 보냅니다.
        return ResponseEntity.ok("장바구니에 상품이 성공적으로 담겼습니다.");
    }
}
