package com.cmyk.threeh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.ItemImg;
import com.cmyk.threeh.dto.ItemImgRequestDTO;
import com.cmyk.threeh.dto.ItemImgResponseDTO;
import com.cmyk.threeh.enums.SubImg;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.ItemImgRepository;
import com.cmyk.threeh.repository.ItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ItemImgService {
    
    private final ItemImgRepository itemImgRepository;
    private final ItemRepository itemRepository;

    //이미지 등록(상품 이미지 저장)

    public ItemImgResponseDTO createItemImg(

        ItemImgRequestDTO dto

    ){

        Item item = itemRepository.findById(dto.getItemId())
             .orElseThrow(()->
            new CustomException(ErrorCode.ITEMIMG_NOT_FOUND));

        ItemImg itemImg = new ItemImg();
        
        itemImg.setItem(item);
        itemImg.setImgName(dto.getImgName());
        itemImg.setImgUrl(dto.getImgUrl());
        itemImg.setSubImgUrl(dto.getSubImgUrl());

        ItemImg savedImg = itemImgRepository.save(itemImg);

        return ItemImgResponseDTO.builder()
            .itemImgId(savedImg.getItemImgId())
            .imgName(savedImg.getImgName())
            .imgUrl(savedImg.getImgUrl())
            .subImgUrl(savedImg.getSubImgUrl())
            .build();

    }

    //이미지 조회(상품 이미지 가져오기)

    public List<ItemImgResponseDTO> getItemImgs(Long itemId){

        return itemImgRepository.findByItem_ItemId(itemId)
        .stream()
        .map(img -> ItemImgResponseDTO.builder() 
            .itemImgId(img.getItemImgId())
            .imgName(img.getImgName())
            .imgUrl(img.getImgUrl())
            .subImgUrl(img.getSubImgUrl())
            .build())
            .collect(Collectors.toList());

    }

    //이미지 수정(이미지 URL 변경)

    public ItemImgResponseDTO updateItemImg(

        Long itemImgId,
        ItemImgRequestDTO dto

    ){

        ItemImg itemImg = itemImgRepository.findById(itemImgId)
            .orElseThrow(()-> 
        new CustomException(ErrorCode.ITEMIMG_NOT_FOUND));

        itemImg.setImgName(dto.getImgName());
        itemImg.setImgUrl(dto.getImgUrl());
        itemImg.setSubImgUrl(dto.getSubImgUrl());

        ItemImg updatedImg = itemImgRepository.save(itemImg);

        return ItemImgResponseDTO.builder()
            .itemImgId(updatedImg.getItemImgId())
            .imgName(updatedImg.getImgName())
            .imgUrl(updatedImg.getImgUrl())
            .subImgUrl(updatedImg.getSubImgUrl())
            .build();
    }


    //이미지 삭제(이미지 제거)

    public void deleteItemImg(Long itemImgId){

        ItemImg itemImg = itemImgRepository.findById(itemImgId)
            .orElseThrow(()->
            new CustomException(ErrorCode.ITEMIMG_NOT_FOUND));
        
        itemImgRepository.delete(itemImg);

    }


    //대표 이미지 조회(썸네일 표시)

    public ItemImgResponseDTO getMainImg(Long itemId) {

        ItemImg itemImg = itemImgRepository
            .findByItem_ItemIdAndSubImg(itemId, SubImg.Y)
            .orElseThrow(() ->
                new CustomException(ErrorCode.ITEMIMG_NOT_FOUND));

        return ItemImgResponseDTO.builder()
        .itemImgId(itemImg.getItemImgId())
        .imgName(itemImg.getImgName())
        .imgUrl(itemImg.getImgUrl())
        .subImgUrl(itemImg.getSubImgUrl())
        .build();
    }




}
