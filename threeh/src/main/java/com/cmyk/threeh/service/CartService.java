package com.cmyk.threeh.service;

import com.cmyk.threeh.repository.CartItemRepository;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.Resource;
import javax.transaction.Transactional;


import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Cart;
import com.cmyk.threeh.domain.CartItem;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.CartDTO;
import com.cmyk.threeh.dto.CartItemDTO;
import com.cmyk.threeh.repository.CartRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {
    
    private final CartItemRepository cartItemRepository;

    @Resource
    private final CartRepository cartRepository;

    @Resource
    private final MemberService memberService;

    @Transactional
    public Cart createCart(String userid) {
        Member member = memberService.getUser(userid);

        Cart cart = new Cart();
        cart.setMember(member);

        return cartRepository.save(cart);
    }

    @Transactional
    public CartDTO getCartDto(String userid) {

        Member member = memberService.getUser(userid);

        Cart cart = cartRepository.findBymember_memberId(member.getMemberId()).orElse(null);

        if(cart == null) {
            cart = createCart(userid);
        }

        CartDTO cartDTO = new CartDTO();
        cartDTO.setCartId(cart.getCartId());
        cartDTO.setMemberId(member.getMemberId());

        List<CartItemDTO> itemDtoList = new ArrayList<>();

        if(cart.getCartItems() != null) {

            for(CartItem item : cart.getCartItems()) {
                CartItemDTO itemDto = new CartItemDTO();
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

    //장바구니 삭제
    @Transactional
    public void deleteCartItem(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    //장바구니 상품 수량 변경
    @Transactional
    public void updateCount(Long cartItemId, int count) {

         CartItem cartItem = cartItemRepository.findById(cartItemId).orElse(null);
            
         if(cartItem == null) {
            throw new IllegalArgumentException("해당 상품이 장바구니에 없습니다.");
         }

         cartItem.setCount(count);
    }


}


