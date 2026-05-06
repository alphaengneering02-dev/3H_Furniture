package com.cmyk.threeh.service;

import com.cmyk.threeh.repository.CartItemRepository;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpSession; // 세션 활용을 위해 추가
import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Cart;
import com.cmyk.threeh.domain.CartItem;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.CartDTO;
import com.cmyk.threeh.dto.CartItemDTO;
import com.cmyk.threeh.dto.SessionMember;
import com.cmyk.threeh.repository.CartRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final MemberService memberService;
    private final HttpSession httpSession;

    // 장바구니 생성
    @Transactional
    public Cart createCart(Member member) {
        Cart cart = new Cart();
        cart.setMember(member);
        return cartRepository.save(cart);
    }

    // 장바구니 목록 조회 (세션 기반으로 변경)
    @Transactional
    public CartDTO getCartDto() {
        // 세션 키 "member"에서 로그인 정보를 꺼냄
        SessionMember sessionMember = (SessionMember) httpSession.getAttribute("member");

        if (sessionMember == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }

        // 세션에 담긴 이메일(또는 ID)로 실제 DB의 Member 엔티티 조회
        Member member = memberService.getUser(sessionMember.getId()); 

        // 해당 회원의 카트 조회
        Cart cart = cartRepository.findBymember_memberId(member.getMemberId()).orElse(null);

        if(cart == null) {
            cart = createCart(member);
        }

        CartDTO cartDTO = new CartDTO();
        cartDTO.setCartId(cart.getCartId());
        cartDTO.setMemberId(member.getMemberId());

        //화면에 뿌려줄 장바구니 상품 리스트 바구니 준비
        List<CartItemDTO> itemDtoList = new ArrayList<>();

        //장바구니에 담긴 상품이 있는지 확인
        if(cart.getCartItems() != null) {
            for(CartItem item : cart.getCartItems()) {
                CartItemDTO itemDto = new CartItemDTO();

                //개별 상품 정보 하나씩 매핑
                itemDto.setCartitemId(item.getCartItemId());
                itemDto.setItemid(item.getItem().getItemId());
                itemDto.setCartid(cart.getCartId());
                itemDto.setCount((long) item.getCount());

                itemDtoList.add(itemDto);
            }
        }

        cartDTO.setCartItems(itemDtoList);
        return cartDTO;
    }

    // 장바구니 상품 삭제
    @Transactional
    public void deleteCartItem(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    // 장바구니 상품 수량 변경
    @Transactional
    public void updateCount(Long cartItemId, int count) {
         CartItem cartItem = cartItemRepository.findById(cartItemId).orElse(null);
            
         if(cartItem == null) {
            throw new IllegalArgumentException("해당 상품이 장바구니에 없습니다.");
         }

         cartItem.setCount(count);
    }
}
