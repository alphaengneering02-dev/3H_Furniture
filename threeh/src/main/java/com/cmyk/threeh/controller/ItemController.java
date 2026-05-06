package com.cmyk.threeh.controller;

import java.util.List;

import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.service.ItemService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ItemController {
    
    private final ItemService itemService;

    //상품 전체 조회

    @GetMapping()
    public List<ItemResponseDTO> getAllItems() {

        return itemService.getAllItems();
    }

    //상품 상세 조회

    @GetMapping("/{itemId}")
    public ItemResponseDTO getItem(@PathVariable Long itemId){
        
        return itemService.getItem(itemId);
    }
  
  
}
