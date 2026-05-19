package com.cmyk.threeh.controller;

import com.cmyk.threeh.repository.ItemRepository;

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

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/main")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")  
public class MainController {

    private final ItemRepository itemRepository;


    //쿼리 스트링을 List<String>으로 변환하는 메소드
    private String[] parseStringToList(String str) {
        if (str==null || str.trim().isEmpty()) {
            return null;
        }
        
        return Arrays.stream(str.split(","))  //쉼표로 구분
                     .map(String::trim)  //앞뒤 공백 제거
                     .toArray(String[]::new);  //배열로 변환
    }


    //상품 통합검색
    // 프론트엔드 URL: http://localhost:8080/api/main/searchResult?searchValue=검색어&space=livingroom,bedroom&kind=desk,chair...
    @GetMapping("/searchResult")
    public List<Item> searchItems(@RequestParam Map<String, String> allParams){

        /*
        <Parameters>
        searchValue: 검색어,
        "space": ["all"],
        "kind": ["all"],
        "brand": ["all"],
        "material": ["all"],
        "size": [1, 6],
        "price": [0, 100]
        */

        //1. 파라미터 추출 및 분해
        //단일 문자열 파라미터
        String searchValue = allParams.get("searchValue");
        if (searchValue != null) {
            searchValue = searchValue.trim();
        }

        //다중선택 배열 파라미터 (예: "거실,침실" -> List<String> ["거실", "침실"])
        String[] space = parseStringToList(allParams.get("space"));
        String[] kind = parseStringToList(allParams.get("kind"));
        String[] brand = parseStringToList(allParams.get("brand"));
        String[] material = parseStringToList(allParams.get("material"));


        //범위형 배열 파라미터 (예: size="1,6" -> min=1, max=6)
        int minSize=0;
        int maxSize=0;

        String sizeParam = allParams.get("size");

        if(sizeParam != null && !sizeParam.isEmpty()) {
            String[] size = sizeParam.split(",");
            minSize = Integer.parseInt(size[0].trim());
            maxSize = Integer.parseInt(size[1].trim());
        }

        int minPrice=0;
        int maxPrice=0;

        String priceParam = allParams.get("price");

        if(priceParam != null && !priceParam.isEmpty()) {
            String[] price = priceParam.split(",");
            minPrice = Integer.parseInt(price[0].trim());
            maxPrice = Integer.parseInt(price[1].trim());
        }
        
        


        //========= [디버깅 확인용 로그] =========
        System.out.println("모든 파라미터: " + allParams);

        System.out.println("------ 분해 완료 데이터 ------");
        System.out.println("검색어: " + searchValue);
        System.out.println("사용공간: " + Arrays.toString(space));
        System.out.println("종류: " + Arrays.toString(kind));
        System.out.println("브랜드: " + Arrays.toString(brand));
        System.out.println("소재: " + Arrays.toString(material));
        System.out.println("최소 사이즈: " + minSize + ", 최대 사이즈: " + maxSize);
        System.out.println("최소 가격: " + minPrice + ", 최대 가격: " + maxPrice);
        System.out.println("------------------------------");
        //========================================

        
        //2. 상품 검색
        //상품리스트 객체생성
        List<Item> list = new ArrayList<Item>();


        //item 테이블에서 검색
        if(searchValue != null) {
            List<Item> list_searchValue = itemRepository.findByItemNameContaining(searchValue);  //ITEM_NAME 컬럼에서 검색
            list.addAll(list_searchValue);
        }
        

        if(space != null) {
            List<Item> list_space = new ArrayList<Item>();

            for(String s : space) {
                List<Item> byCategory = itemRepository.findByItemCategory(s);  //ITEM_CATEGORY 컬럼에서 검색
                list_space.addAll(byCategory);
            }

            list.addAll(list_space);
        }

        if(kind != null) {
            List<Item> list_kind = new ArrayList<Item>();

            for(String k : kind) {
                List<Item> byName = itemRepository.findByItemNameContaining(k);
                List<Item> byCategory = itemRepository.findByItemCategory(k);  //ITEM_NAME + ITEM_CATEGORY 컬럼에서 검색
                list_kind.addAll(byName);
                list_kind.addAll(byCategory);
            }

            list.addAll(list_kind);
        }

        if(brand != null) {
            List<Item> list_brand = new ArrayList<Item>();

            for(String b : brand) {
                List<Item> byName = itemRepository.findByItemNameContaining(b);
                List<Item> byCategory = itemRepository.findByItemCategory(b);  //ITEM_NAME + ITEM_CATEGORY 컬럼에서 검색
                list_brand.addAll(byName);
                list_brand.addAll(byCategory);
            }

            list.addAll(list_brand);
        }

        if(material != null) {
            List<Item> list_material = new ArrayList<Item>();

            for(String m : material) {
                List<Item> byName = itemRepository.findByItemNameContaining(m);
                List<Item> byCategory = itemRepository.findByItemCategory(m);  //ITEM_NAME + ITEM_CATEGORY 컬럼에서 검색
                list_material.addAll(byName);
                list_material.addAll(byCategory);
            }

            list.addAll(list_material);
        }

        //파라미터가 들어온 경우에만 작동
        if(sizeParam != null) {
            List<Item> list_size = new ArrayList<Item>();

            for(int i=minSize; i<=maxSize; i++) {
                String iStr = String.valueOf(i);  //1, 2, 3, 4, 5, 6

                List<Item> byName = itemRepository.findByItemNameContaining(iStr);
                List<Item> byCategory = itemRepository.findByItemCategory(iStr);  //ITEM_NAME + ITEM_CATEGORY 컬럼에서 검색
                list_size.addAll(byName);
                list_size.addAll(byCategory);
            }

            list.addAll(list_size);
        }
        
        if(priceParam != null) {
            List<Item> list_price = itemRepository.findByItemPriceBetween(minPrice, maxPrice);
            list.addAll(list_price);
        }



        // 3. 순서를 유지하면서 중복만 제거된 새로운 리스트 생성
        List<Item> distinctList = new ArrayList<>(new LinkedHashSet<>(list));


        return distinctList;
    }
    
}
