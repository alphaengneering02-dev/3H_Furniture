package com.cmyk.threeh.controller;

import java.security.Principal; // 팀 시큐리티 연동을 위해 공식 주입
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.CartDTO;
import com.cmyk.threeh.dto.CartItemDTO;
import com.cmyk.threeh.service.CartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mypage") // 💡 원래 원하셨던 본래 마이페이지 경로 정상 복구
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") 
public class CartController {

    private final CartService cartService;

    // 장바구니 목록조회 (팀 시큐리티 체계 완전 동화 버전)
    @GetMapping("/cart")
    public ResponseEntity<?> cartList(Principal principal) { 

        // 조원들이 구축한 시큐리티 시스템에서 현재 로그인한 사용자의 ID를 정석으로 검증합니다.
        if (principal == null || principal.getName() == null) {
            // 팀 시큐리티 EntryPoint 규격에 맞춰 401 에러 반환
            return ResponseEntity.status(401).body("로그인이 필요합니다."); 
        }

        // 인증된 유저의 아이디를 서비스로 보내 장바구니 데이터를 안전하게 가져옵니다.
        String loginUserId = principal.getName();
        CartDTO cartDTO = cartService.getCartDto(loginUserId);
        
        return ResponseEntity.ok(cartDTO); 
    }

    // 장바구니 상품 삭제
    @PostMapping("/cart/delete/{cartItemId}")
    public ResponseEntity<String> deleteCartItem(@PathVariable Long cartItemId, Principal principal) {
        
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        cartService.deleteCartItem(cartItemId);
        return ResponseEntity.ok("상품이 삭제되었습니다."); 
    }

    // 장바구니 수량 변경
    @PostMapping("/cart/update")
    public ResponseEntity<String> updateCount(@RequestParam("cartItemId") Long cartItemId, @RequestParam("count") int count, Principal principal) {

        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        cartService.updateCount(cartItemId, count);
        return ResponseEntity.ok("수량이 변경되었습니다."); 
    }

    // 주문 페이지로 토스 (조장님 규격 orderItems 완전 싱크)
    @PostMapping("/cart/toss")
    public ResponseEntity<?> tossToOrder(@RequestBody Map<String, List<Long>> requestData, Principal principal) {

        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다");
        }

        List<Long> checkedCartItemIds = requestData.get("cartItemIds");

        try {
            String loginUserId = principal.getName();
            List<CartItemDTO> orderItems = cartService.tossToOrderPage(loginUserId, checkedCartItemIds);
            Long realOrderId = (long) (Math.random() * 90000) + 10000L;
            
            // Java 8 호환 명시적 HashMap 패킹 구조
            Map<String, Object> response = new HashMap<String, Object>();
            response.put("orderId", realOrderId);
            response.put("orderItems", orderItems); 
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("DB 주문 생성 실패:" + e.getLocalizedMessage());
        }
    }
}
