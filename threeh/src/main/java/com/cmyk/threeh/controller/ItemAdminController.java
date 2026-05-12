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

import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;
import com.cmyk.threeh.service.ItemService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/item")
//@PreAuthorize("hasRole('ADMIN')") 로그인 구현될때까지 주석처리
public class ItemAdminController {

    private final ItemService itemService;

    //상품 등록
    @PostMapping()
    public ItemResponseDTO createItems(@RequestBody ItemRequestDTO dto,Authentication authentication) {

        //System.out.println("category: " + dto.getCategory());
        //System.out.println("itemName: " + dto.getItemName());
        //System.out.println("currency: " + dto.getCurrency());

        //String adLoginId = authentication.getName(); (어드민 로그인 되면 주석 풀고 아래 코딩 지우기)
        //로그인 구현 전 임시 관리자 아이디
        String adLoginId = "admin1";
        return itemService.createItems(dto,adLoginId);   
    }


    //상품 수정

     @PutMapping("/{itemId}")
    public ItemResponseDTO updateItem(@PathVariable Long itemId, @RequestBody ItemUpdateRequestDTO dto, Authentication authentication) {
        
        //String adLoginId = authentication.getName();
        //로그인 구현 전 임시 관리자 아이디
        String adLoginId = "admin1";

        return itemService.updateItem(itemId,adLoginId,dto);
    }

    //상품 삭제

      @DeleteMapping("/{itemId}")
    public void deleteItem(@PathVariable Long itemId, Authentication authentication){


      //  String adLoginId= authentication.getName();
      //로그인 구현 전 임시 관리자 아이디
        String adLoginId = "admin1";  
      itemService.deleteItem(itemId,adLoginId);
    }
}
