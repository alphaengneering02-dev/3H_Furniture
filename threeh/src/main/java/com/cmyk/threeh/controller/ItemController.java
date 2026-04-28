package com.cmyk.threeh.controller;

import java.util.List;

import javax.annotation.Resource;

import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;
import com.cmyk.threeh.service.ItemService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/items")
public class ItemController {
    
    @Resource
    private final ItemService itemService;

    //상품 등록(createItems)
    
    @PostMapping()
    public ItemResponseDTO createItems(@RequestBody ItemRequestDTO dto) {

        return itemService.createItems(dto);
    }

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


    //상품 수정

    @PutMapping("/{itemId}")
    public ItemResponseDTO updateItem(@PathVariable Long itemId, @RequestBody ItemUpdateRequestDTO dto) {
        
        return itemService.updateItem(itemId, dto);
    }

    //상품 삭제

    @DeleteMapping("/{itemId}")
    public void deleteItem(@PathVariable Long itemId){

        itemService.deleteItem(itemId);
    }
    
}
