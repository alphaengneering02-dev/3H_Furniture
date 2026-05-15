package com.cmyk.threeh.controller;

import java.security.Principal; // 팀 시큐리티 연동을 위해 주입
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

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
// [팀 프로토콜 완벽 결합] 팀원들의 세션 프리패스 대문자 주소 규칙인 /Member 하위로 장바구니 주소를 완벽 정착시킵니다.
@RequestMapping("/api/Member/cart") 
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") 
public class CartController {

    private final CartService cartService;

    // 장바구니 목록조회 (팀 로그인 체계 완전 동화 버전)
    @GetMapping("/list/{id}")
    public ResponseEntity<?> cartList(Principal principal) { 

        // [핵심 교정] 세션이 끊겨 비로그인 상태일 때, HTML 통짜로 튕겨서 리액트를 터트리지 않고
        // 팀원분들이 SecurityConfig에 구축해 놓은 401 JSON 규격 명세와 완전히 똑같이 빌드하여 리턴합니다.
        if (principal == null || principal.getName() == null) {
            Map<String, Object> errorMap = new HashMap<String, Object>();
            errorMap.put("status", false);
            errorMap.put("message", "로그인이 필요한 서비스입니다.");
            
            // 리액트가 .catch(err => { if(err.response.status === 401) ... }) 문으로 안전 진입하도록 유도
            return ResponseEntity.status(401).body(errorMap); 
        }

        // 인증이 완벽히 입증된 유저의 아이디 문자열을 정석대로 서비스로 보냅니다.
        String loginUserId = principal.getName();
        CartDTO cartDTO = cartService.getCartDto(loginUserId);
        
        return ResponseEntity.ok(cartDTO); 
    }

    // 장바구니 상품 삭제
    @PostMapping("/delete/{cartItemId}")
    public ResponseEntity<?> deleteCartItem(@PathVariable Long cartItemId, Principal principal) {
        
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        cartService.deleteCartItem(cartItemId);
        return ResponseEntity.ok("상품이 삭제되었습니다."); 
    }

    // 장바구니 수량 변경
    @PostMapping("/update")
    public ResponseEntity<String> updateCount(@RequestParam("cartItemId") Long cartItemId, @RequestParam("count") int count, Principal principal) {

        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        cartService.updateCount(cartItemId, count);
        return ResponseEntity.ok("수량이 변경되었습니다."); 
    }

    // 주문 페이지로 토스 (조장님 규격 orderItems 완전 싱크)
    @PostMapping("/toss")
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
            response.put("orderItems", orderItems); // 조장님 변수 규격 강제 일치
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("DB 주문 생성 실패:" + e.getLocalizedMessage());
        }
    }

    // ----------------------------------------------------------------------
    // [질문자님 소유 배송지 연동 신규 라인] 기존 코드를 보존하고 맨 아래에 깔끔하게 이식 완료
    // ----------------------------------------------------------------------

    // 새 배송지 추가 (마이페이지에서 키보드로 입력한 순수 주소 글자들을 내 MemberAddress 테이블에 저장)
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
            // 내 서비스의 순수 주소 문자열 적재 메서드 호출
            cartService.addNewAddress(loginUserId, city, street, addrDetail);
            return ResponseEntity.ok("배송지가 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("배송지 저장 실패: " + e.getMessage());
        }
    }

    // 내 배송지 목록 조회 (주문서 화면에서 내가 수동으로 추가해 둔 글자 데이터들만 쏙 긁어와 리액트에 토스)
    @GetMapping("/address/list")
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
