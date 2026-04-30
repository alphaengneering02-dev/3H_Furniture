package com.cmyk.threeh.service;

import javax.annotation.Resource;
import javax.transaction.Transactional;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Cart;
import com.cmyk.threeh.domain.CartItem;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.form.CartItemForm;
import com.cmyk.threeh.repository.CartItemRepository;
import com.cmyk.threeh.repository.CartRepository;
import com.cmyk.threeh.repository.ItemRepository; 

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartItemService {
    
    @Resource
    private final CartItemRepository cartItemRepository;

    @Resource
    private final CartRepository cartRepository;
    
    @Resource
    private final ItemRepository itemRepository; 
    
    @Resource
    private final MemberService memberService;

    @Transactional
    public void addCartItem(String userid, CartItemForm form) {
        
        Member member = memberService.getUser(userid);
        
        Cart cart = cartRepository.findBymember_memberId(member.getMemberId()).orElse(null);
        if (cart == null) {
        throw new IllegalArgumentException("장바구니가 없습니다.");
    }

        Item item = itemRepository.findById(form.getItemId()).orElse(null);
        if (item == null) {
        throw new IllegalArgumentException("상품이 존재하지 않습니다.");
    }

        CartItem savedItem = cartItemRepository.findByCart_CartIdAndItem_ItemId(cart.getCartId(), item.getItemId());

        if (savedItem != null) {
            savedItem.setCount(savedItem.getCount() + form.getCount());
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setItem(item);
            cartItem.setCount(form.getCount());
            cartItemRepository.save(cartItem);
        }
    }
}
