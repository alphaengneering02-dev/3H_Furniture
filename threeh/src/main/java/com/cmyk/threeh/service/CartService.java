package com.cmyk.threeh.service;

import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Cart;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.repository.CartRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {
    
    private final CartRepository cartRepository;
    private final MemberService memberService;

    public Cart createCart(String userid) {

        Member member = memberService.getUser(userid);

        Cart cart = new Cart();
        cart.setMember(member);

        return cartRepository.save(cart);

    }
    
}