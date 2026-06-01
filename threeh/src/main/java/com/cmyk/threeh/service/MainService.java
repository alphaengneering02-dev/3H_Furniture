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

        // =========================================================================
        // ★ 조기 탈락(Fast-Fail) 조건 설정
        // 카테고리가 없거나(Array(0)), 색상이 없거나(Array(0)), 가격이 [0,0]인 경우
        // 하나라도 해당되면(OR) 더 이상 로직을 실행하지 않고 즉시 빈 리스트를 반환하여 탈락시킵니다.
        // =========================================================================
        // 1. 넘어온 배열 파라미터 정제 (빈 문자열 제거)
        List<String> categoryList = (category!=null) 
            ? Arrays.stream(category).filter(element -> element!=null && !element.trim().isEmpty()).collect(Collectors.toList()) 
            : new ArrayList<>();
            
        List<String> colorList = (color!=null) 
            ? Arrays.stream(color).filter(element -> element!=null && !element.trim().isEmpty()).collect(Collectors.toList()) 
            : new ArrayList<>();

        //가격대가 [0, 0]인지 확인함
        boolean isPriceZero = false;
        if(price!=null && price.length==2) {
            try {
                int min=Integer.parseInt(price[0].trim());
                int max=Integer.parseInt(price[1].trim());
                if (min==0 && max==0) {
                    isPriceZero = true; //[0, 0] 일 때 true
                }
            } catch (NumberFormatException e) {
                //숫자 변환 실패 시 기본적으로 탈락시키지 않음 (안전장치)
                System.out.println("\n[MainService] 숫자 변환 실패 (isPriceZero==false)");
            }
        }

        //상품 데이터에 대한 조기탈락 검사
        if (categoryList.isEmpty() || colorList.isEmpty() || isPriceZero) {
            System.out.println("\n[MainService] 필수 검색 조건 미충족으로 인해 빈 결과 반환 (모든 상품 탈락)");
            return new ArrayList<>(); 
        }


        // =========================================================================
        // ★ 위의 검사를 무사히 통과한 경우에만, 전체 상품을 가져와 필터링 시작
        // =========================================================================
        // 1. 전체 상품 가져오기
        List<ItemResponseDTO> allItems = itemService.getAllItems();


        // 2. 반복문(Stream) 돌기 전, 배열을 리스트로 한 번만 변환하여 성능 최적화
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
                // 검색어가 null이거나 비어있으면 패스 (모든 상품 통과)
                if (searchValue==null || searchValue.trim().isEmpty()) {
                    return true;
                }

                String lowerSearchValue = searchValue.trim().toLowerCase();
                String dtoByItemName = dto.getItemName();
                String dtoByItemCategory = dto.getItemCategory();
                String dtoByItemColor = dto.getItemColor();

                
                // 1. 상품명 검사 (대소문자 구분 없음)
                boolean isMatchedName = dtoByItemName!=null 
                                        && dtoByItemName.toLowerCase().contains(lowerSearchValue);
                // 2. 카테고리 검사 (대소문자 구분 없음)
                boolean isMatchedCategory = dtoByItemCategory!=null 
                                            && dtoByItemCategory.toLowerCase().contains(lowerSearchValue);
                // 3. 색상 검사 (대소문자 구분 없음)
                boolean isMatchedColor = dtoByItemColor!=null 
                                        && dtoByItemColor.toLowerCase().contains(lowerSearchValue);

                // 세 개 중 하나라도 매칭되면 true를 반환 (OR 조건)
                return isMatchedName || isMatchedCategory || isMatchedColor;
            })


            // B. category 필터: 배열에 값이 있을 때만 카테고리 일치 여부 확인
            .filter(dto -> {
                String dtoByCategory = dto.getItemCategory();
                boolean isMatched = dtoByCategory!=null && categoryList.contains(dtoByCategory);
                
                return isMatched;
            })


            // C. color 필터: 배열에 값이 있을 때만 카테고리 일치 여부 확인
            .filter(dto -> {
                String dtoByColor = dto.getItemColor();
                boolean isMatched = dtoByColor != null && colorList.contains(dtoByColor);

                return isMatched;
            })


            // D. price 필터: 배열에 값이 있을 때만 카테고리 일치 여부 확인
            .filter(dto -> {
                try {
                    //최소, 최대값 추출 (예: price="100,500" -> min=100만원, max=500만원)
                    int min = Integer.parseInt(price[0].trim()) * 10000;
                    int max = Integer.parseInt(price[1].trim()) * 10000;
                    
                    //가격대 비교
                    int itemPrice = dto.getItemPrice(); 
                    int itemDiscountPrice = dto.getItemDiscountPrice();
                    int itemTotalPrice = itemPrice - itemDiscountPrice;
                    
                    return itemTotalPrice>=min && itemTotalPrice<=max;
                    
                } catch (NumberFormatException e) {  //파라미터가 숫자가 아닐 경우 패스 (전체 허용)
                    System.out.println("[Warning] 가격 필터 숫자 변환 오류. 넘어온 값: " + Arrays.toString(price));
                    return true; 
                }
            })

            // 3. 결과를 리스트로 수집 (중복 제거 로직 포함)
            .collect(Collectors.toList());

    }
}
