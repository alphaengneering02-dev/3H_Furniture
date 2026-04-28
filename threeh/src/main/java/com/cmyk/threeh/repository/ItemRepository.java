package com.cmyk.threeh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.enums.ItemSellStatus;

public interface ItemRepository extends JpaRepository<Item,Long>{
    
    //상품명 조회
    List<Item> findItemName(String itemName);

    //판매중 상품 조회
    List<Item> findByItemSellStatus(ItemSellStatus selltatus);

    //상품 카테고리 조회
    List<Item> findByItemCategory(String category);
    
    //상품명 조회
    List<Item> findByItemNameContaining(String keyword);

}
