package com.cmyk.threeh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
	
	Optional<Cart> findBymember_memberId(Long memberId);
	
}
