package com.cmyk.threeh.service;

import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Cart;
import com.cmyk.threeh.domain.CartItem;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.repository.CartItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartItemService {
    
    private final CartItemRepository cartItemRepository;
    private final MemberService memberService;

    public CartItem createCartItem(String userid) {

        Member member = memberService.getUser(userid);

        Cart cart = new Cart();
        cart.setMember(member);

        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);

        return cartItemRepository.save(cartItem);

    }
    
}