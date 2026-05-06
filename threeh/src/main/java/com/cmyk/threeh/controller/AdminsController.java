package com.cmyk.threeh.controller;

import com.cmyk.threeh.service.ItemService;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;


@Controller
public class AdminsController {

    private final ItemService itemService;

    AdminsController(ItemService itemService) {
        this.itemService = itemService;
    }

    // 관리자 메인
    @GetMapping("/admins")
    public String admin() {
        return "forward:/index.html";
    }

    /* 
    // 1. 상품 등록
    @PostMapping("/products")
    public ItemResponseDTO create(@RequestBody ItemRequestDTO dto) {
        return itemService.createItems(dto, 1L);
    }

    // 2. 상품 수정
    @PutMapping("/products/{id}")
    public ItemResponseDTO update(
            @PathVariable Long itemId,
            @RequestBody ItemUpdateRequestDTO dto
    ) {
        return itemService.updateItem(itemId, 1L, dto);
    }

    // 3. 상품 단건 조회
    @GetMapping("/products/{id}")
    public ItemResponseDTO getOne(@PathVariable Long itemId) {
        return itemService.getItem(itemId);
    }

    // 4. 상품 목록 조회
    @GetMapping("/products")
    public List<ItemResponseDTO> getAll() {
        return itemService.getAllItems();
    }

    // 5. 상품 삭제
    @DeleteMapping("/products/{id}")
    public void delete(@PathVariable Long itemId) {
        itemService.deleteItem(itemId, 1L);
    }

    */
}