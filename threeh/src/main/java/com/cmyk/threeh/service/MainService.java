package com.cmyk.threeh.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;

import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.repository.ItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MainService {

    private final ItemService itemService;
    private final ItemRepository itemRepository;


    //상품 통합검색
    //프론트엔드 URL: http://localhost:8080/api/main/searchResult?searchValue=검색어&category=livingroom,bedroom&color=desk
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> searchItems(String searchValue, String[] category, String[] color) {

        /*
        <Parameters>
        searchValue: 검색어,
        "category": [],
        "color": []
        */


        // 1. 전체 상품 가져오기
        List<ItemResponseDTO> allItems = itemService.getAllItems();


        // 2. 반복문(Stream) 돌기 전, 배열을 리스트로 한 번만 변환하여 성능 최적화
        List<String> categoryList = (category!=null) ? Arrays.asList(category) : null;
        List<String> colorList = (color!=null) ? Arrays.asList(color) : null;


        // ========= [서비스 진입 로그] =========
        System.out.println("\n====== [MainService 진입] ======");
        System.out.println("넘어온 검색어: " + searchValue);
        System.out.println("넘어온 카테고리 리스트: " + categoryList);
        System.out.println("넘어온 색상 리스트: " + colorList);
        System.out.println("===============================\n");

        
        // 2. Stream을 활용하여 동적 필터링 적용 (모든 조건을 AND로 연결)
        return allItems.stream()
            // A. searchValue 필터: 값이 있을 때만 포함 여부(contains) 확인 (대소문자 구분 없음)
            .filter(dto -> {
                if (searchValue == null || searchValue.trim().isEmpty()) {
                    return true; // 검색어가 없으면 패스 (전체 허용)
                }

                String dtoByItemName = dto.getItemName();
                String lowerSearchValue = searchValue.trim().toLowerCase();
                boolean isMatched = dtoByItemName!=null 
                                    && dtoByItemName.toLowerCase().contains(lowerSearchValue);

                return isMatched;
            })

            // B. category 필터: 배열에 값이 있을 때만 카테고리 일치 여부 확인
            .filter(dto -> {
                if (category == null || category.length == 0) {
                    return true; // 카테고리 지정이 없으면 패스
                }

                String dtoByCategory = dto.getItemCategory();
                boolean isMatched = dtoByCategory != null && categoryList.contains(dtoByCategory);
                
                return isMatched;
            })

            // C. color 필터: 배열에 값이 있을 때만 색상 일치 여부 확인
            .filter(dto -> {
                if (color == null || color.length == 0) {
                    return true; // 색상 지정이 없으면 패스
                }

                String dtoByColor = dto.getItemColor();
                boolean isMatched = dtoByColor != null && colorList.contains(dtoByColor);

                return isMatched;
            })

            // 3. 결과를 리스트로 수집 (중복 제거 로직 포함)
            .collect(Collectors.toList());

    }


    
}
