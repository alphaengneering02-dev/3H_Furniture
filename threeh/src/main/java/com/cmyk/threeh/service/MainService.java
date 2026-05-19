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
    //프론트엔드 URL: http://localhost:8080/api/main/searchResult?searchValue=검색어&category=거실,침실&color=White,Black
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> searchItems(String searchValue, String[] category, String[] color, String[] price) {

        /*
        <Parameters>
        searchValue: 검색어,
        "category": [],
        "color": [],
        "price": [0, 500]
        */


        // 1. 전체 상품 가져오기
        List<ItemResponseDTO> allItems = itemService.getAllItems();


        // 2. 반복문(Stream) 돌기 전, 배열을 리스트로 한 번만 변환하여 성능 최적화
        List<String> categoryList = (category!=null) ? Arrays.asList(category) : null;
        List<String> colorList = (color!=null) ? Arrays.asList(color) : null;
        List<String> priceList = (price!=null) ? Arrays.asList(price) : null;


        // ========= [서비스 진입 로그] =========
        System.out.println("\n====== [MainService 진입] ======");
        System.out.println("넘어온 검색어: " + searchValue);
        System.out.println("넘어온 카테고리 리스트: " + categoryList);
        System.out.println("넘어온 색상 리스트: " + colorList);
        System.out.println("넘어온 색상 리스트: " + priceList);
        System.out.println("===============================\n");

        
        // 2. Stream을 활용하여 동적 필터링 적용 (모든 조건을 AND로 연결)
        return allItems.stream()
            // A. searchValue 필터: 상품명, 카테고리, 색상 중 하나라도 검색어를 포함하면 허용 (OR 연산)
            .filter(dto -> {
                if (searchValue == null || searchValue.trim().isEmpty()) {
                    return true; // 검색어가 없으면 패스 (전체 허용)
                }

                String lowerSearchValue = searchValue.trim().toLowerCase();
                String dtoByItemName = dto.getItemName();
                String dtoByItemCategory = dto.getItemCategory();
                String dtoByItemColor = dto.getItemColor();

                
                // 1. 상품명 검사 (대소문자 구분 없음)
                boolean isMatchedName = dtoByItemName != null 
                                        && dtoByItemName.toLowerCase().contains(lowerSearchValue);

                // 2. 카테고리 검사 (대소문자 구분 없음)
                boolean isMatchedCategory = dtoByItemCategory != null 
                                            && dtoByItemCategory.toLowerCase().contains(lowerSearchValue);

                // 3. 색상 검사 (대소문자 구분 없음)
                boolean isMatchedColor = dtoByItemColor != null 
                                        && dtoByItemColor.toLowerCase().contains(lowerSearchValue);

                // 세 개 중 하나라도 매칭되면 true를 반환 (OR 조건)
                return isMatchedName || isMatchedCategory || isMatchedColor;
            })

            // B. category 필터: 배열에 값이 있을 때만 카테고리 일치 여부 확인
            .filter(dto -> {
                if (category == null || category.length == 0) {
                    return true; // 카테고리 지정이 없으면 패스 (전체 허용)
                }

                String dtoByCategory = dto.getItemCategory();
                boolean isMatched = dtoByCategory != null && categoryList.contains(dtoByCategory);
                
                return isMatched;
            })

            // C. color 필터
            .filter(dto -> {
                if (color == null || color.length == 0) {
                    return true; // 색상 지정이 없으면 패스
                }

                String dtoByColor = dto.getItemColor();
                boolean isMatched = dtoByColor != null && colorList.contains(dtoByColor);

                return isMatched;
            })

            // D. price 필터
            .filter(dto -> {
                if (price == null || price.length < 2) {
                    return true;   //최소, 최대값이 다 없으면 패스
                }

                try {
                    //최소, 최대값 추출 (예: price="100,500" -> min=100만원, max=500만원)
                    int min = Integer.parseInt(price[0].trim()) * 10000;
                    int max = Integer.parseInt(price[1].trim()) * 10000;
                    
                    //가격대 비교
                    int itemPrice = dto.getItemPrice(); 
                    int itemDiscountPrice = dto.getItemDiscountPrice();
                    int itemTotalPrice = itemPrice - itemDiscountPrice;
                    
                    return itemTotalPrice >= min && itemTotalPrice <= max;
                    
                } catch (NumberFormatException e) {  //파라미터가 숫자가 아닐 경우 패스 (전체 허용)
                    System.out.println("[Warning] 가격 필터 숫자 변환 오류. 넘어온 값: " + Arrays.toString(price));
                    return true; 
                }
            })

            // 3. 결과를 리스트로 수집 (중복 제거 로직 포함)
            .collect(Collectors.toList());

    }
}
