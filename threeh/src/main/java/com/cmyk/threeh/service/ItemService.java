package com.cmyk.threeh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ItemService {
    
    private final ItemRepository itemRepository;
    private final AdminsRepository adminsRepository;
    //상품등록(관리자 검증 필요)

    public ItemResponseDTO createItems(ItemRequestDTO dto,Long adminId){

        Admins admin = adminsRepository.findById(adminId)
            .orElseThrow(()->new IllegalArgumentException("존재하지 않는 관리자입니다."));

        Item item = new Item();

        item.setAdmin(admin);
        item.setCategory(dto.getCategory());
        item.setItemName(dto.getItemName());
        item.setItemDetail(dto.getItemDetail());
        item.setItemColor(dto.getItemColor());
        item.setPrice(dto.getPrice());
        item.setDiscountPrice(dto.getDiscountPrice());
        item.setCurrency(dto.getCurrency());
        item.setStock(dto.getStock());

        Item savedItem = itemRepository.save(item);


        return ItemResponseDTO.builder()
            .itemId(savedItem.getItemId())
            .adminId(savedItem.getAdmin().getAdminId())
            .itemName(savedItem.getItemName())
            .itemDetail(savedItem.getItemDetail())
            .category(savedItem.getCategory())
            .itemColor(savedItem.getItemColor())
            .price(savedItem.getPrice())
            .discountPrice(savedItem.getDiscountPrice())
            .currency(savedItem.getCurrency())
            .stock(item.getStock())
            .build();

    }

    //상품 전체 조회

    public List<ItemResponseDTO> getAllItems(){

       return itemRepository.findAll()
        .stream()
        .map(item->ItemResponseDTO.builder()
            .itemId(item.getItemId())
            .itemName(item.getItemName())
            .price(item.getPrice())
            .stock(item.getStock())
            .build())
            .collect(Collectors.toList());

    }

    //상품 상세 조회

    public ItemResponseDTO getItem(Long itemId){

        Item item = itemRepository.findById((itemId))
            .orElseThrow(()->
            new CustomException(ErrorCode.ITEM_NOT_FOUND)); 


        return ItemResponseDTO.builder()
            .itemId(item.getItemId())
            .itemName(item.getItemName())
            .itemDetail(item.getItemDetail())
            .price(item.getPrice())
            .stock(item.getStock())
            .build();
    }


    //상품수정 (Item.java에서 만들어놓은 validatePrice(),validateStock()사용)

    public ItemResponseDTO updateItem(

        Long itemId,
        Long adminId,
        ItemUpdateRequestDTO dto
    ){
        Admins admin = adminsRepository.findById(adminId)
            .orElseThrow(()-> new IllegalArgumentException("존재하지 않는 관리자입니다."));

        Item item = itemRepository.findById(itemId)
            .orElseThrow(()->
            new CustomException(ErrorCode.ITEM_NOT_FOUND)); 

         if(!item.getAdmin().getAdminId().equals(admin.getAdminId())){
            throw new IllegalArgumentException("수정 권한이 없습니다.")
         ;}

        item.updateItem(
            item.getCategory(),
            dto.getItemName(),
            dto.getItemDetail(),
            item.getItemColor(),
            dto.getPrice(),
            item.getDiscountPrice(),
            item.getCurrency(),
            dto.getStock()
        );

        Item updatedItem = itemRepository.save(item);

        return ItemResponseDTO.builder()
            .itemId(updatedItem.getItemId())
            .itemName(updatedItem.getItemName())
            .price(updatedItem.getPrice())
            .stock(updatedItem.getStock())
            .build();
    }


    //상품삭제

    public void deleteItem(Long itemId, Long adminId){

        Admins admin = adminsRepository.findById(adminId)
            .orElseThrow(()-> new IllegalArgumentException("존재하지 않는 관리자입니다."));

        Item item = itemRepository.findById(itemId)
            .orElseThrow(()->
            new CustomException(ErrorCode.ITEM_NOT_FOUND)); 

        if(!item.getAdmin().getAdminId().equals(admin.getAdminId())){
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }
            itemRepository.delete(item);
    }

    //관리자 조회 + 검증 추가




}

