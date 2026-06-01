package com.cmyk.threeh.controller;

import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.service.MainService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.dto.ItemResponseDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/main")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")  
public class MainController {

    private final MainService mainService;


    //쿼리 스트링을 String[]으로 변환하는 메소드
    private String[] parseStringToArray(String str) {
        if (str==null || str.trim().isEmpty()) {
            return null;
        }
        
        return Arrays.stream(str.split(","))  //쉼표로 구분
                     .map(String::trim)  //앞뒤 공백 제거
                     .filter(s -> !s.isEmpty()) // 빈 문자열 제외
                     .toArray(String[]::new);  //배열로 변환
    }


    //상품 통합검색
    //프론트엔드 URL: http://localhost:8080/api/main/searchResult?searchValue=검색어&category=거실,침실&color=White,Black
    @GetMapping("/searchResult")
    public List<ItemResponseDTO> searchItems(
        @RequestParam(required=false) String searchValue,
        @RequestParam(required=false) String[] category,
        @RequestParam(required=false) String[] color,
        @RequestParam(required=false) String[] price) {

        //========= [디버깅 확인용 로그] =========
        System.out.println("\n====== [MainController 진입] ======");
        System.out.println("검색어: " + searchValue);

        if(category!=null && category.length!=0) {
            System.out.println("카테고리: " + Arrays.toString(category));
        } else {
            System.out.println("카테고리: " + null);
        }

        if(color!=null && color.length!=0) {
            System.out.println("색상: " + Arrays.toString(color));
        } else {
            System.out.println("색상: " + null);
        }
        
        if(price!=null && price.length!=0) {
            System.out.println("가격대: " + Arrays.toString(price));
        } else {
            System.out.println("가격대: " + null);
        }
        System.out.println("=====================================");
        //========================================

        List<ItemResponseDTO> searchResult = mainService.searchItems(searchValue, category, color, price);

        return searchResult;
    }
    
}
