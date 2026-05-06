package com.cmyk.threeh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.ItemImg;
import com.cmyk.threeh.dto.ItemImgRequestDTO;
import com.cmyk.threeh.dto.ItemImgResponseDTO;
import com.cmyk.threeh.enums.SubImg;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.repository.ItemImgRepository;
import com.cmyk.threeh.repository.ItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ItemImgService {
    
    private final ItemImgRepository itemImgRepository;
    private final ItemRepository itemRepository;
    private final AdminsRepository adminsRepository;

    //DTO를 각 메소드마다 불러오면 오타가 나니까 실수 방지용.
    private ItemImgResponseDTO toDto(ItemImg itemImg){

        return ItemImgResponseDTO.builder()
            .itemImgId(itemImg.getItemImgId())
            .imgName(itemImg.getImgName())
            .imgUrl(itemImg.getImgUrl())
            .subImgUrl(itemImg.getSubImgUrl())
            .subImg(itemImg.getSubImg())
            .build();
    }

     //SecurityContext 캡슐화(반복 코딩 방지)
    private String getLoginId(){
        return SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();
    }

    //SecurityContext 캡술+권한 확인 반복 코딩 방지 캡슐

    private Admins getCurrentAdmin(){
        String adLoginId = getLoginId();
        
        return adminsRepository.findByAdLoginId(adLoginId)
            .orElseThrow(()->new CustomException(ErrorCode.ADMIN_NOT_FOUND));
    }

    //이미지가 있는지 없는지 검증용 코딩 캡슐화
    
    private void validateImgIs(ItemImg itemImg, Admins admin){
        if(!itemImg.getItem().getAdmin().getAdminId().equals(admin.getAdminId())){
            throw new CustomException(ErrorCode.NO_PERMISSION);
        }
    }

    //이미지 등록

    public ItemImgResponseDTO createItemImg(ItemImgRequestDTO dto){

        //Role_ADMIN만 등록 가능하도록. 관리자 존재 확인
        Admins admin = getCurrentAdmin();

        Item item = itemRepository.findById(dto.getItemId())
             .orElseThrow(()->
            new CustomException(ErrorCode.ITEM_NOT_FOUND));
        
        ItemImg itemImg = new ItemImg();
        itemImg.setItem(item);
        itemImg.setImgName(dto.getImgName());
        itemImg.setImgUrl(dto.getImgUrl());
        itemImg.setSubImgUrl(dto.getSubImgUrl());
        itemImg.setSubImg(dto.getSubImg() !=null? dto.getSubImg() : SubImg.N);

        ItemImg savedImg = itemImgRepository.save(itemImg);

        return toDto(savedImg);

    }

    //이미지 조회
    @Transactional(readOnly = true)
    public List<ItemImgResponseDTO> getItemImgs(Long itemId){

        return itemImgRepository.findByItem_ItemId(itemId)
        .stream()
        .map(this::toDto)
        .collect(Collectors.toList());

    }

    //이미지 수정(JPA dirty checking으로 save 없이, update반영하고 트랜젝션 어노테이션)
    @Transactional
    public ItemImgResponseDTO updateItemImg(Long itemImgId,
        ItemImgRequestDTO dto){

        //Role_ADMIN만 수정가능하도록. 
        Admins admin = getCurrentAdmin();

        ItemImg itemImg = itemImgRepository.findById(itemImgId)
            .orElseThrow(()-> 
        new CustomException(ErrorCode.ITEMIMG_NOT_FOUND));

        //이미지 존재 확인
        validateImgIs(itemImg,admin);
        
        itemImg.setImgName(dto.getImgName());
        itemImg.setImgUrl(dto.getImgUrl());
        itemImg.setSubImgUrl(dto.getSubImgUrl());

        return toDto(itemImg);
    }


    //이미지 삭제(이미지 제거)

    @Transactional
    public void deleteItemImg(Long itemImgId){

        //Role_ADMIN 만 삭제가능하도록. 
        Admins admin = getCurrentAdmin();

        ItemImg itemImg = itemImgRepository.findById(itemImgId)
            .orElseThrow(()->
            new CustomException(ErrorCode.ITEMIMG_NOT_FOUND));

        //이미지 존재 확인
        validateImgIs(itemImg,admin);
    
        itemImgRepository.delete(itemImg);

    }


    //대표 이미지 조회(썸네일 표시)

    public ItemImgResponseDTO getMainImg(Long itemId) {

        ItemImg itemImg = itemImgRepository
            .findByItem_ItemIdAndSubImg(itemId, SubImg.Y)
            .orElseThrow(() ->
                new CustomException(ErrorCode.ITEMIMG_NOT_FOUND));

        return toDto(itemImg);
    }

}
