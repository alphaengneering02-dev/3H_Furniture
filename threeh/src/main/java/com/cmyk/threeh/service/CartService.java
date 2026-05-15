package com.cmyk.threeh.service;

import com.cmyk.threeh.repository.CartItemRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 다른 팀원과 완전 일치시킴
import lombok.RequiredArgsConstructor;

import com.cmyk.threeh.domain.Cart;
import com.cmyk.threeh.domain.CartItem;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.ItemImg;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.MemberAddress; // 주소록 엔티티 포함
import com.cmyk.threeh.dto.CartDTO;
import com.cmyk.threeh.dto.CartItemDTO;
import com.cmyk.threeh.enums.SubImg;
import com.cmyk.threeh.repository.CartRepository;
import com.cmyk.threeh.repository.ItemImgRepository;
import com.cmyk.threeh.repository.ItemRepository; // 누락되었던 상품 레포지토리 임포트 추가
import com.cmyk.threeh.repository.MemberAddressRepository; // 주소록 리포지토리 포함

@Service
@RequiredArgsConstructor
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final ItemRepository itemRepository; // 오라클 ITEM 테이블 조회를 위해 명확히 변수 선언
    private final MemberService memberService;
    private final com.cmyk.threeh.service.ItemImgService itemImgService;
    private final MemberAddressRepository memberAddressRepository; 
    private final ItemImgRepository itemImgRepository;

    // 장바구니 생성 (기존 규격 보존)
    @Transactional
    public Cart createCart(Member member) {
        Cart cart = new Cart();
        cart.setMember(member);
        return cartRepository.save(cart);
    }

    @Transactional(readOnly = true)
    public CartDTO getCartDTO(String loginUserId) {
        Member member = memberService.getUser(loginUserId);

        Cart cart = cartRepository.findBymember_memberId(member.getMemberId())
            .orElseGet(() -> createCart(member));

        CartDTO cartDTO = new CartDTO();
        cartDTO.setCartId(cart.getCartId());
        cartDTO.setMemberId(member.getMemberId());

        List<CartItemDTO> itemDtoList = new ArrayList<>();
        List<CartItem> cartItems = cartItemRepository.findByCart_CartId(cart.getCartId());

        if(cartItems != null && !cartItems.isEmpty()) {
            for (CartItem item : cartItems) {
                CartItemDTO dto = new CartItemDTO();

                dto.setCartItemId(item.getCartItemId());
                dto.setItemId(item.getItem().getItemId());
                dto.setCartId(cart.getCartId());
                dto.setCount((long)item.getCount());

                dto.setItemName(item.getItem().getItemName());
                dto.setOrderPrice((long)item.getItem().getItemPrice());

                String dbFileName = itemImgRepository.findByItem_ItemIdAndThumbnailYn(item.getItem().getItemId(), SubImg.Y)
                    .map(ItemImg::getItemImgUrl) 
                    .orElse("default.jpg"); 

                    dto.setImageUrl(dbFileName);

                itemDtoList.add(dto);
            }

            cartDTO.setItemName(itemDtoList.get(0).getItemName());
            cartDTO.setOrderPrice(itemDtoList.get(0).getOrderPrice().intValue());
        }
        cartDTO.setCartItems(itemDtoList);
        return cartDTO;
    }

    //상품 삭제
    @Transactional
    public void deleteCartItem(Long cartItemId) { //컨트롤러가 호출하는 대문자 cartItemId 규칙 완벽 일치
        // 조장님이 레포지토리에 선언해 둔 단건 조회 메서드 활용
        CartItem cartItem = cartItemRepository.findByCartItemId(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("삭제 대상 상품이 장바구니에 없습니다."));
        
        cartItemRepository.delete(cartItem);
        System.out.println("오라클 DB 장바구니 아이템 영구 삭제 완료: " + cartItemId);
    }

    //상품 수량 변경
    @Transactional
    public void updateCount(Long cartItemId, int count) { //컨트롤러가 호출하는 대문자 cartItemId 규칙 완벽 일치
         CartItem cartItem = cartItemRepository.findByCartItemId(cartItemId)
                 .orElseThrow(() -> new IllegalArgumentException("변경 대상 상품이 장바구니에 없습니다."));
         
         cartItem.setCount(count); // 수량 덮어쓰기 후 JPA 자동 업데이트 발동
         System.out.println("오라클 DB 장바구니 수량 실시간 변경 성공 - 아이템: " + cartItemId + " / 수량: " + count);
    }

    @Transactional
    public void addCart(String loginUserId, CartItemDTO cartItemDTO) {
        Member member = memberService.getUser(loginUserId);

        Cart cart = cartRepository.findBymember_memberId(member.getMemberId())
            .orElseGet(() -> createCart(member));

        // 들어온 매개변수명(cartItemDTO)과 변수 선언(itemRepository) 싱크 완벽 조율
        Item item = itemRepository.findById(cartItemDTO.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("오라클 DB에 존재하지 않는 가구 상품입니다."));
                
        if((long)item.getItemStock() < cartItemDTO.getCount()) {
            throw new RuntimeException("선택하신 수량이 현재 매장 재고(" + item.getItemStock() + "개)를 초과했습니다");
        }

        // 장바구니에 동일한 가구가 들어있는지 중복 판별
        CartItem existItem = cartItemRepository.findByCart_CartIdAndItem_ItemId(cart.getCartId(), item.getItemId());

        if(existItem != null) {
            // DTO의 Long count를 엔티티의 int 규격에 맞게 intValue로 가공하여 합산
            existItem.setCount(existItem.getCount() + cartItemDTO.getCount().intValue());
            // CartItem 엔티티이므로 cartItemRepository 창고에 저장하도록 정정
            cartItemRepository.save(existItem);
        } else {
            CartItem newCartItem = new CartItem();
            newCartItem.setCart(cart);
            newCartItem.setItem(item);
            // DTO의 Long count를 엔티티의 int count 규격으로 형변환하여 대입
            newCartItem.setCount(cartItemDTO.getCount().intValue());

            cartItemRepository.save(newCartItem);
        }
    }

    // 내 테이블에 순수 텍스트 주소록 문자열 영구 인서트 처리
    @Transactional
    public void addNewAddress(String loginUserId, String city, String street, String addrDetail) {
        Member member = memberService.getUser(loginUserId);
        if (member == null) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다.");
        }

        MemberAddress memberAddress = new MemberAddress();
        memberAddress.setMember(member); 
        memberAddress.setAddr(city + " " + street); 
        memberAddress.setAddrDetail(addrDetail);
        memberAddress.setIsDefault("N");

        memberAddressRepository.save(memberAddress);
    }

    // 내가 입력한 진짜 주소 문자열만 정밀 수집하여 리액트로 토스
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyAddressList(String loginUserId) {
        Member member = memberService.getUser(loginUserId);
        List<MemberAddress> addrList = memberAddressRepository.findByMember_MemberId(member.getMemberId());
        
        List<Map<String, Object>> resultList = new ArrayList<>();
        if (addrList != null) {
            for (MemberAddress addr : addrList) {
                Map<String, Object> map = new HashMap<>();
                
                map.put("id", addr.getAddrId()); 
                map.put("addr", addr.getAddr()); 
                map.put("addrDetail", addr.getAddrDetail()); 
                
                resultList.add(map);
            }
        }
        return resultList;
    }
}
