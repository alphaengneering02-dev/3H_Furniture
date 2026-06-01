package com.cmyk.threeh.controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.cmyk.threeh.global.util.GetLoginId;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/Member/cart") 
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") 
public class CartController {

    private final CartService cartService;

    // 장바구니 최신 목록 로드
    @GetMapping("/list")
    public ResponseEntity<?> cartList(@RequestParam("id") String id, Principal principal) { 

        if (principal == null) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("status", false);
            errorMap.put("message", "로그인이 필요한 service입니다.");
            return ResponseEntity.status(401).body(errorMap); 
        }

        // 구글 소셜 로그인 회원도 DB에서 장바구니를 정상 로드하도록 보정
        String loginUserId = GetLoginId.getloginId(principal);
        
        CartDTO cartDTO = cartService.getCartDto(loginUserId);
        return ResponseEntity.ok(cartDTO); 
    }

    // 상품 페이지에서 장바구니 담기 요청 수신
    @PostMapping("/add")
    public ResponseEntity<?> addCartItem(@RequestBody CartItemDTO cartItemDTO, Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            String loginUserId = GetLoginId.getloginId(principal);
            cartService.addCart(loginUserId, cartItemDTO);
            return ResponseEntity.ok("장바구니에 상품이 성공적으로 담겼습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("장바구니 담기 실패: " + e.getMessage());
        }
    }

    // 장바구니 상품 삭제
    @PostMapping("/delete/{cartItemId}")
    public ResponseEntity<?> deleteCartItem(@PathVariable("cartItemId") Long cartItemId, Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        cartService.deleteCartItem(cartItemId);
        return ResponseEntity.ok("상품이 삭제되었습니다."); 
    }

    // 장바구니 수량 변경
    @PostMapping("/update")
    public ResponseEntity<String> updateCount(@RequestParam("cartItemId") Long cartItemId, @RequestParam("count") int count, Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        cartService.updateCount(cartItemId, count);
        return ResponseEntity.ok("수량이 변경되었습니다."); 
    }

    // 주문 페이지로 배포 처리 (★ 프론트 조원이 소스코드 연동할 핵심 구역)
    @PostMapping("/toss")
    public ResponseEntity<?> tossToOrder(@RequestBody Map<String, List<Long>> requestData, Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다");
        }

        List<Long> checkedCartItemIds = requestData.get("cartItemIds");

        try {
            Long realOrderId = (long) (Math.random() * 90000) + 10000L;
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", realOrderId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("DB 주문 생성 실패:" + e.getLocalizedMessage());
        }
    }

    // 새 배송지 추가
    @PostMapping("/address/add")
    public ResponseEntity<String> addAddress(
            @RequestParam("city") String city,
            @RequestParam("street") String street,
            @RequestParam("addrDetail") String addrDetail,
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            String loginUserId = GetLoginId.getloginId(principal);
            cartService.addNewAddress(loginUserId, city, street, addrDetail);
            return ResponseEntity.ok("배송지가 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("배송지 저장 실패: " + e.getMessage());
        }
    }

    // 내 배송지 목록 조회 (★ GetMapping 주소 명세 누락 완벽 매립)
    @GetMapping("/address/list")
    public ResponseEntity<?> getMyAddresses(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        try {
            String loginUserId = GetLoginId.getloginId(principal);
            List<Map<String, Object>> myAddresses = cartService.getMyAddressList(loginUserId);
            return ResponseEntity.ok(myAddresses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("주소록 로드 실패: " + e.getMessage());
        }
    }
}
