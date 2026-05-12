package com.cmyk.threeh.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cmyk.threeh.dto.ItemImgRequestDTO;
import com.cmyk.threeh.dto.ItemImgResponseDTO;
import com.cmyk.threeh.enums.SubImg;
import com.cmyk.threeh.service.ItemImgService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itemImgs")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")  
public class ItemImgController {
    
    private final ItemImgService itemImgService;

    //이미지 등록(상품 이미지 URL  등록 방식 )_createItemImg

    @PostMapping("/createItemImg")
    public ItemImgResponseDTO createItemImg(@RequestBody ItemImgRequestDTO dto) {
        
        return itemImgService.createItemImg(dto);
    }

    //이미피 파일 업로드 방식(WebConfig.java)
    @PostMapping("/uploadItemImg")
    public ItemImgResponseDTO updateItemImg(@RequestParam Long itemId,
        @RequestParam MultipartFile file,
        @RequestParam SubImg thumbnailYn
    ){
        return itemImgService.uploadItemImg(itemId,file,thumbnailYn);
    }

    //이미지 조회(상품 이미지 가져오기)_getItemImgs

    @GetMapping("/{itemId}")
    public List<ItemImgResponseDTO> getItemIgms(@PathVariable Long itemId) {
        return itemImgService.getItemImgs(itemId);
    } 

    //이미지 수정(이미지 URL변경)_updateItemImg

    @PutMapping("/{itemImgId}")
    public ItemImgResponseDTO updateItemImg(@PathVariable Long itemImgId, @RequestBody ItemImgRequestDTO dto){
        
        return itemImgService.updateItemImg(itemImgId, dto);
    }

    //이미지 삭제(이미지 제거)_deleteItemImg

    @DeleteMapping("/{itemImgId}")
    public void deleteItemImg(@PathVariable Long itemImgId){

        itemImgService.deleteItemImg(itemImgId);
    }

}
