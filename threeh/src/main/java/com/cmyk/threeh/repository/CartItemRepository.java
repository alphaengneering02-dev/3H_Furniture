package com.cmyk.threeh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long>{

    Optional<CartItem> findByCartItemId(Long cartitemid);

    
}
