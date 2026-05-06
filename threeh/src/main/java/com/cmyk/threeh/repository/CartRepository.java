package com.cmyk.threeh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
	
	
     //[회원별 장바구니 조회]
     //회원의 고유 식별자(memberId)를 기준으로 장바구니를 검색
     //@param memberId 조회할 회원의 PK
     //@return Optional(Cart) - 장바구니가 존재하지 않을 경우 안전한 처리를 위해 Optional로 반환
	Optional<Cart> findBymember_memberId(Long memberId);
	
}
