package com.cmyk.threeh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    
    //상품등록(관리자 검증 필요->관리자(admin)만 가능)

    public ItemResponseDTO createItems(ItemRequestDTO dto, String adLoginId){

        Admins admin = adminsRepository.findByAdLoginId(adLoginId)
        .orElseThrow(()->new CustomException(ErrorCode.ADMIN_NOT_FOUND));
        Item item = Item.create(dto, admin);

        Item savedItem = itemRepository.save(item);

        return ItemResponseDTO.from(savedItem);
    }

    //상품 전체 조회(일반회원,관리자 모두 가능)

    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getAllItems(){

       return itemRepository.findAll()
        .stream()
        .map(ItemResponseDTO::from)
        .collect(Collectors.toList());

    }

    //상품 상세 조회(일반회원,관리자 모두 가능)

    @Transactional(readOnly = true)
    public ItemResponseDTO getItem(Long itemId){

        Item item = itemRepository.findById((itemId))
            .orElseThrow(()->
            new CustomException(ErrorCode.ITEM_NOT_FOUND)); 


        return ItemResponseDTO.from(item);
    }


    //상품수정 (엔티티 내부 로직 사용)
    //JPA dirty checking 자동 반영되니까 SAVE필요없음. 단 트랜젝션 어노테이션이 있어야 변경 반영이 됌.

    @Transactional
    public ItemResponseDTO updateItem(

        Long itemId,
        String adLoginId,
        ItemUpdateRequestDTO dto

    ){
        Admins admin = adminsRepository.findByAdLoginId(adLoginId)
            .orElseThrow(()-> new CustomException(ErrorCode.NO_PERMISSION));

        Item item = itemRepository.findById(itemId)
            .orElseThrow(()->
            new CustomException(ErrorCode.ITEM_NOT_FOUND)); 

         if(!item.getAdmin().getAdminId().equals(admin.getAdminId())){
            throw new CustomException(ErrorCode.NO_PERMISSION);
         }
          
        item.itemUpdate(dto);

        return ItemResponseDTO.from(item);

    }

    //상품삭제(관리자(admin)만 가능)

    @Transactional
    public void deleteItem(Long itemId, String adLoginId){

        Admins admin = adminsRepository.findByAdLoginId(adLoginId)
            .orElseThrow(()-> new CustomException(ErrorCode.NO_PERMISSION));

        Item item = itemRepository.findById(itemId)
            .orElseThrow(()->
            new CustomException(ErrorCode.ITEM_NOT_FOUND)); 

        if(!item.getAdmin().getAdminId().equals(admin.getAdminId())){
            throw new CustomException(ErrorCode.NO_PERMISSION);
        }
            itemRepository.delete(item);
    }

    //관리자 조회 + 검증 추가




}

