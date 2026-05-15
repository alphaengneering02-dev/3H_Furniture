package com.cmyk.threeh.controller;

<<<<<<< Updated upstream
import java.security.Principal; // 팀 시큐리티 연동 필수 주입
import java.util.HashMap;
import java.util.List;
import java.util.Map;
=======
import javax.annotation.Resource;
import javax.servlet.http.HttpSession;
>>>>>>> Stashed changes

import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.cmyk.threeh.dto.CartDTO;
import com.cmyk.threeh.dto.CartItemDTO;
import com.cmyk.threeh.service.CartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
// 팀원들의 세션 프리패스 대문자 주소 규칙인 /api/Member/cart 경로 확정
@RequestMapping("/api/Member/cart") 
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") 
public class CartController {

    private final CartService cartService;

    //
    @GetMapping("/list")
    public ResponseEntity<?> cartList(@RequestParam("id") String id, Principal principal) { 

        // 비로그인 상태일 때 터지지 않도록 401 JSON 규격 리턴
        if (principal == null || principal.getName() == null) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("status", false);
            errorMap.put("message", "로그인이 필요한 service입니다.");
            return ResponseEntity.status(401).body(errorMap); 
        }

        String loginUserId = principal.getName();
        // 서비스 명세 규칙에 맞게 getCartDTO로 명칭 일치화
        CartDTO cartDTO = cartService.getCartDTO(loginUserId);
        
        return ResponseEntity.ok(cartDTO); 
    }

    //상품 페이지에서 장바구니 담기 요청 수신
    @PostMapping("/add")
    public ResponseEntity<?> addCartItem(@RequestBody CartItemDTO cartItemDTO, Principal principal) {
        
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            String loginUserId = principal.getName();
            // 서비스 허브단으로 수집된 가구 데이터 토스 적재
            cartService.addCart(loginUserId, cartItemDTO);
            return ResponseEntity.ok("장바구니에 상품이 성공적으로 담겼습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("장바구니 담기 실패: " + e.getMessage());
        }
    }

    //장바구니 상품 삭제
    @PostMapping("/delete/{cartItemId}")
    public ResponseEntity<?> deleteCartItem(@PathVariable("cartItemId") Long cartItemId, Principal principal) {
        
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        // 직접 DB를 지우지 않고, 안전하게 주입된 cartService 창구로 토스 이행
        cartService.deleteCartItem(cartItemId);
        return ResponseEntity.ok("상품이 삭제되었습니다."); 
    }

    //장바구니 수량 변경
    @PostMapping("/update")
    public ResponseEntity<String> updateCount(@RequestParam("cartItemId") Long cartItemId, @RequestParam("count") int count, Principal principal) {

        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        // 직접 변수를 바꾸지 않고, 안전하게 주입된 cartService 창구로 토스 이행
        cartService.updateCount(cartItemId, count);
        return ResponseEntity.ok("수량이 변경되었습니다."); 
    }

    //주문 페이지로 배포 처리
    @PostMapping("/toss")
    public ResponseEntity<?> tossToOrder(@RequestBody Map<String, List<Long>> requestData, Principal principal) {

        if (principal == null || principal.getName() == null) {
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

    //새 배송지 추가
    @PostMapping("/address/add")
    public ResponseEntity<String> addAddress(
            @RequestParam("city") String city,
            @RequestParam("street") String street,
            @RequestParam("addrDetail") String addrDetail,
            Principal principal) {

        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            String loginUserId = principal.getName();
            cartService.addNewAddress(loginUserId, city, street, addrDetail);
            return ResponseEntity.ok("배송지가 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("배송지 저장 실패: " + e.getMessage());
        }
    }

    //내 배송지 목록 조회
    public ResponseEntity<?> getMyAddresses(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        try {
            String loginUserId = principal.getName();
            List<Map<String, Object>> myAddresses = cartService.getMyAddressList(loginUserId);
            return ResponseEntity.ok(myAddresses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("주소록 로드 실패: " + e.getMessage());
        }
    }
}
