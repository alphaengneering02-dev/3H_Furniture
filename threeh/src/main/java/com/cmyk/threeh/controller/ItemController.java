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
@RequestMapping("/products")
public class ItemController {
    
    private final ItemService itemService;

    //상품 등록(createItems)
    
    @PostMapping()
    public ItemResponseDTO createItems(@RequestBody ItemRequestDTO dto) {

        //System.out.println("category: " + dto.getCategory());
        //System.out.println("itemName: " + dto.getItemName());
        //System.out.println("currency: " + dto.getCurrency());
     
        return itemService.createItems(dto, 1L);   
    }

    //**1L은 임시로 현재 로그인한 관리자 의미로
    // 나중에 Spring Security+JWT붙이면 Long adminId = 로그인한 관리자 ID로 자동 교체됨 */


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
        
        return itemService.updateItem(itemId, 1L, dto);
    }

    //상품 삭제

    @DeleteMapping("/{itemId}")
    public void deleteItem(@PathVariable Long itemId){

        itemService.deleteItem(itemId, 1L);
    }
    
}
