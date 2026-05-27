package com.cmyk.threeh.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;
import com.cmyk.threeh.service.ItemImgService;
import com.cmyk.threeh.service.ItemService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/item")
@PreAuthorize("hasRole('ADMIN')")
public class ItemAdminController {

    private final ItemService itemService;
    private final ItemImgService itemImgService;

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

    //상품 삭제(기존 코딩)

    //@DeleteMapping("/{itemId}")
    //public void deleteItem(@PathVariable Long itemId, Authentication authentication){

      //String adLoginId= authentication.getName();
      //itemService.deleteItem(itemId,adLoginId);
    //}

    //상품 삭제 추가
    @DeleteMapping("/{itemId}")
    public ResponseEntity<String> deleteItem(
        @PathVariable Long itemId,
        Authentication authentication
    ){
      String adLoginId = authentication.getName();

      List<String> itemImgUrls = itemService.deleteItem(itemId, adLoginId);

        for(String itemImgUrl : itemImgUrls){
          itemImgService.deletePhysicalFile(itemImgUrl);
        }

        return ResponseEntity.ok("상품이 삭제되었습니다.");
    }

      @GetMapping("/{itemId}/deletable")
    public ResponseEntity<Boolean> canDeleteItem(
          @PathVariable Long itemId,
          Authentication authentication
    ) {
        String adLoginId = authentication.getName();

        boolean deletable = itemService.canDeleteItem(itemId, adLoginId);

        return ResponseEntity.ok(deletable);
    }
}
