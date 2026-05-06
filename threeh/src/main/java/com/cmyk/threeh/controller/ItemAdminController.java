package com.cmyk.threeh.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.domain.CustomMemberDetails;
import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;
import com.cmyk.threeh.service.ItemService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class ItemAdminController {

    private final ItemService itemService;

    //상품 등록
    @PostMapping()
    public ItemResponseDTO createItems(@RequestBody ItemRequestDTO dto,Authentication authentication) {

        //System.out.println("category: " + dto.getCategory());
        //System.out.println("itemName: " + dto.getItemName());
        //System.out.println("currency: " + dto.getCurrency());

        String adLoginId = authentication.getName();
        return itemService.createItems(dto,adLoginId);   
    }


    //상품 수정

     @PutMapping("/{itemId}")
    public ItemResponseDTO updateItem(@PathVariable Long itemId, @RequestBody ItemUpdateRequestDTO dto, Authentication authentication) {
        
        String adLoginId = authentication.getName();

        return itemService.updateItem(itemId,adLoginId,dto);
    }

    //상품 삭제

      @DeleteMapping("/{itemId}")
    public void deleteItem(@PathVariable Long itemId, Authentication authentication){


        String adLoginId= authentication.getName();
        itemService.deleteItem(itemId,adLoginId);
    }
}
