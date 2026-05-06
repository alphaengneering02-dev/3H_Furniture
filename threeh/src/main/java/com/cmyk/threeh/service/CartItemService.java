package com.cmyk.threeh.service;

import javax.servlet.http.HttpSession;
import javax.transaction.Transactional;
import org.springframework.stereotype.Service;
import com.cmyk.threeh.domain.Cart;
import com.cmyk.threeh.domain.CartItem;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.SessionMember;
import com.cmyk.threeh.form.CartItemForm;
import com.cmyk.threeh.repository.CartItemRepository;
import com.cmyk.threeh.repository.CartRepository;
import com.cmyk.threeh.repository.ItemRepository; 
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartItemService {
    
    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final ItemRepository itemRepository; 
    private final MemberService memberService;
    private final HttpSession httpSession; 

    @Transactional
    public void addCartItem(CartItemForm form) { 
    
        //현재 브라우저 세션에서 로그인안 회원 정보 가져옴
    SessionMember sessionMember = (SessionMember) httpSession.getAttribute("member");
     // 로그인이 되어있지 않은 경우 예외 발생 (방어 로직)
    if (sessionMember == null) {
        throw new IllegalStateException("로그인이 필요합니다.");
    }

    // 세션에 담긴 로그인 ID(문자열)를 사용하여 실제 DB에 저장된 Member 엔티티 객체를 조회
    // 이 과정을 통해 memberId(PK) 등 상세 회원 정보를 확보함
    Member member = memberService.getUser(sessionMember.getId());
    
    Cart cart = cartRepository.findBymember_memberId(member.getMemberId()).orElse(null);
    // 장바구니가 없는 유저(첫 사용 등)일 경우, 즉석에서 새 장바구니를 생성하고 DB에 저장
    if (cart == null) {
        cart = new Cart();
        cart.setMember(member);
        cart = cartRepository.save(cart);
    }
    // 사용자가 담으려는 상품(Item)이 실제로 DB에 존재하는지 확인
        Item item = itemRepository.findById(form.getItemId()).orElse(null);
        if (item == null) throw new IllegalArgumentException("상품이 존재하지 않습니다.");
    // 현재 장바구니(cartId) 내에 이미 똑같은 상품(itemId)이 들어있는지 조회
        CartItem savedItem = cartItemRepository.findByCart_CartIdAndItem_ItemId(cart.getCartId(), item.getItemId());

        if (savedItem != null) {
            // 이미 상품이 존재한다면, 새로운 행을 만들지 않고 기존 상품의 수량(count)만 합산 업데이트
            savedItem.setCount(savedItem.getCount() + form.getCount());
        } else {
            // 장바구니에 없던 새 상품이라면, CartItem 엔티티를 새로 생성하여 장바구니-상품-수량을 연결해 저장
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setItem(item);
            cartItem.setCount(form.getCount());
            cartItemRepository.save(cartItem);
        }
    }
}
