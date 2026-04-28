package com.cmyk.threeh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Item;
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

    //상품등록

    public ItemResponseDTO createItem(ItemRequestDTO dto){

        Item item = new Item();

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
            .itemName(item.getItemName())
            .price(item.getPrice())
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

    //상품 상세 수정

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
        ItemUpdateRequestDTO dto
    ){

        Item item = itemRepository.findById(itemId)
            .orElseThrow(()->
            new CustomException(ErrorCode.ITEM_NOT_FOUND)); 

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

    public void deleteItem(Long itemId){

        Item item = itemRepository.findById(itemId)
            .orElseThrow(()->
            new CustomException(ErrorCode.ITEM_NOT_FOUND)); 

            itemRepository.delete(item);
    }


}

