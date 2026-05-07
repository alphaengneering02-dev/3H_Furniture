package com.cmyk.threeh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.enums.ItemSellStatus;

public interface ItemRepository extends JpaRepository<Item,Long>{
    
    //상품명 조회
    List<Item> findByItemName(String itemName);

    //판매중 상품 조회
    List<Item> findByItemSellStatus(ItemSellStatus itemSellStatus);

    //상품 카테고리 조회
    List<Item> findByItemCategory(String itemCategory);
    
    //상품명 조회
    List<Item> findByItemNameContaining(String keyword);

    //가격범위 검색
    List<Item>findByItemPriceBetween(int min, int max);

    //카테고리랑 상품 판매상태
    List<Item> findByItemCategoryAndItemSellStatus(
        String itemCategory,
        ItemSellStatus status
    );

    //상품 등록 순(최신순)
    List<Item> findAllByOrderByItemIdDesc();
}
