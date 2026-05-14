package com.cmyk.threeh.service;

import com.cmyk.threeh.repository.CartItemRepository;
import java.util.ArrayList;
import java.util.List;

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
    private final CartRepository cartRepository;
    private final MemberService memberService;
    private final com.cmyk.threeh.service.ItemImgService itemImgService;

    // 장바구니 생성
    @Transactional
    public Cart createCart(Member member) {
        Cart cart = new Cart();
        cart.setMember(member);
        return cartRepository.save(cart);
    }

    // 장바구니 목록 조회 (팀 시큐리티 로그인 ID 기반 정석 조회 버전)
    @Transactional
    public CartDTO getCartDto(String loginUserId) {

        // 💡 팀원들이 인증을 완료한 로그인 ID로 실제 DB의 Member 엔티티 정석 조회
        Member member = memberService.getUser(loginUserId); 

        // 해당 회원의 카트 조회
        Cart cart = cartRepository.findBymember_memberId(member.getMemberId()).orElse(null);

        if(cart == null) {
            cart = createCart(member);
        }

        CartDTO cartDTO = new CartDTO();
        cartDTO.setCartId(cart.getCartId());
        cartDTO.setMemberId(member.getMemberId());

        //화면에 뿌려줄 장바구니 상품 리스트 바구니 준비
        List<CartItemDTO> itemDtoList = new ArrayList<CartItemDTO>();

        //장바구니에 담긴 상품이 있는지 확인
        if(cart.getCartItems() != null) {
            for(CartItem item : cart.getCartItems()) {
                CartItemDTO itemDto = new CartItemDTO();

                //개별 상품 정보 하나씩 매핑
                itemDto.setCartitemId(item.getCartItemId());
                itemDto.setItemid(item.getItem().getItemId());
                itemDto.setCartid(cart.getCartId());
                itemDto.setCount((long) item.getCount());
                
                if (item.getItem() != null) {
                    itemDto.setItemName(item.getItem().getItemName());
                    itemDto.setOrderPrice((long) item.getItem().getItemPrice());

                    try {
                        // 조장님의 이미지 정석 서비스 호출
                        com.cmyk.threeh.dto.ItemImgResponseDTO itemImage = itemImgService.getMainImg(item.getItem().getItemId());

                        if(itemImage != null && itemImage.getItemImgUrl() != null) {
                            itemDto.setImageUrl(itemImage.getItemImgUrl());
                        } else {
                            itemDto.setImageUrl(null);
                        }
                    } catch (Exception e) {
                        itemDto.setImageUrl(null);
                    }
                    
                    // 무한 루프를 방지하기 위해 cartDTO 상위에 직접 박지 않고, 
                    // 리액트단 연산 편의를 위해 장바구니 상위 DTO의 대표 필드에는 '첫 번째 상품'의 기본 정보만 안전하게 딱 한 번 바인딩합니다.
                    if (cartDTO.getItemName() == null) {
                        cartDTO.setItemName(item.getItem().getItemName());
                        cartDTO.setOrderPrice(item.getItem().getItemPrice());
                    }
                } 
                
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
         cartItemRepository.saveAndFlush(cartItem);
    }

    // 신규 추가 (팀 시큐리티 ID 기반 조장님 오더 페이지 토스 마감)
    @Transactional
    public List<CartItemDTO> tossToOrderPage(String loginUserId, List<Long> checkedCartItemIds) {
        
        List<CartItemDTO> tossList = new ArrayList<CartItemDTO>();

        for (Long cartItemId : checkedCartItemIds) {
            CartItem cartItem = cartItemRepository.findById(cartItemId).orElse(null);
            if (cartItem != null && cartItem.getItem() != null) {
                CartItemDTO itemDto = new CartItemDTO();
                
                itemDto.setCartitemId(cartItem.getCartItemId());
                itemDto.setItemid(cartItem.getItem().getItemId());
                itemDto.setCartid(cartItem.getCart().getCartId());
                itemDto.setCount((long) cartItem.getCount());
                itemDto.setItemName(cartItem.getItem().getItemName());
                itemDto.setOrderPrice((long) cartItem.getItem().getItemPrice());
                
                try {
                    com.cmyk.threeh.dto.ItemImgResponseDTO itemImage = itemImgService.getMainImg(cartItem.getItem().getItemId());
                    if(itemImage != null) {
                        itemDto.setImageUrl(itemImage.getItemImgUrl());
                    }
                } catch (Exception e) {
                    itemDto.setImageUrl(null);
                }

                tossList.add(itemDto);
            }
        }

        return tossList;
    }
}
