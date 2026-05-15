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
    public void addCartItem(String userid, CartItemForm form) {
        
        //사용자 정보 조회
        Member member = memberService.getUser(userid);
        
        //해당 사용자의 장바구니가 있는지 확인
        Cart cart = cartRepository.findBymember_memberId(member.getMemberId()).orElse(null);
        if (cart == null) {
        throw new IllegalArgumentException("장바구니가 없습니다.");
    }

        //담으려는 상품이 실제로 존재하는지 확인
        Item item = itemRepository.findById(form.getItemId()).orElse(null);
        if (item == null) {
        throw new IllegalArgumentException("상품이 존재하지 않습니다.");
    }

        //해당 장바구니에 중복된 상품이 있는지 확인
        CartItem savedItem = cartItemRepository.findByCart_CartIdAndItem_ItemId(cart.getCartId(), item.getItemId());

        if (savedItem != null) {//중복된 상품이면 수량만 더해줌
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
