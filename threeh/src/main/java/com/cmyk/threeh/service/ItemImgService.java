package com.cmyk.threeh.service;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

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

    @Value("${file.upload.path}")
    private String uploadPath;

    @Value("${file.upload.url}")
    private String uploadUrl;

    //DTO를 각 메소드마다 불러오면 오타가 나니까 실수 방지용.
    private ItemImgResponseDTO toDto(ItemImg itemImg){

        return ItemImgResponseDTO.builder()
            .itemImgId(itemImg.getItemImgId())
            .itemImgName(itemImg.getItemImgName())
            .itemImgUrl(itemImg.getItemImgUrl())
            .itemSubImgUrl(itemImg.getItemSubImgUrl())
            .thumbnailYn(itemImg.getThumbnailYn())
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

    //이미지 등록(URL등록 방식)

    public ItemImgResponseDTO createItemImg(ItemImgRequestDTO dto){

        //Role_ADMIN만 등록 가능하도록. 관리자 존재 확인
        Admins admin = getCurrentAdmin();

        Item item = itemRepository.findById(dto.getItemId())
             .orElseThrow(()->
            new CustomException(ErrorCode.ITEM_NOT_FOUND));
        
        ItemImg itemImg = new ItemImg();
        itemImg.setItem(item);
        itemImg.setItemImgName(dto.getItemImgName());
        itemImg.setItemImgUrl(dto.getItemImgUrl());
        itemImg.setItemSubImgUrl(dto.getItemSubImgUrl());
        itemImg.setThumbnailYn(dto.getThumbnailYn() !=null? dto.getThumbnailYn() : SubImg.N);

        ItemImg savedImg = itemImgRepository.save(itemImg);

        return toDto(savedImg);

    }

    //이미지 파일 업로드 
    //예: chair.jpg 업로드하면, 실제 파일 저장: C:/VSCode/3H_Furniture/threeh_upload/itemImgs/랜덤UUID.jpg
    //DB저장: ITEM_IMG_NAME = chair.jpg, ITEM_IMG_URL = /upload/item/랜덤UUID.jpg, SUBIMG_YN = Y 또는 N

    public ItemImgResponseDTO uploadItemImg(
        Long itemId,
        MultipartFile file,
        SubImg thumbnailYn
    ){
        Admins admin = getCurrentAdmin();

        Item item = itemRepository.findById(itemId)
            .orElseThrow(()->new CustomException(ErrorCode.NO_PERMISSION));

        if(!item.getAdmin().getAdminId().equals(admin.getAdminId())){
            throw new CustomException(ErrorCode.NO_PERMISSION);
        }

        if(file == null || file.isEmpty()){
            throw new CustomException(ErrorCode.NO_IMGFILE);
        }
        try{
            File folder = new File(uploadPath);
            
            if(!folder.exists()){
                folder.mkdirs();
            }

            String originalFileName = file.getOriginalFilename();

            String ext = originalFileName.substring(originalFileName.lastIndexOf("."));

            String savedFileName =UUID.randomUUID().toString() + ext;

            File saveFile = new File(uploadPath + savedFileName);

            file.transferTo(saveFile);

            ItemImg itemImg = new ItemImg();

            itemImg.setItem(item);
            itemImg.setItemImgName(originalFileName);
            itemImg.setItemImgUrl(uploadPath + savedFileName);
            itemImg.setItemSubImgUrl(null);
            itemImg.setThumbnailYn(thumbnailYn !=null ? thumbnailYn : SubImg.N);

            ItemImg savedImg = itemImgRepository.save(itemImg);

            return toDto(savedImg);
        }catch(IOException e){
            throw new RuntimeException("이미지 업로드 실패",e);
        }
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
        
        itemImg.setItemImgName(dto.getItemImgName());
        itemImg.setItemImgUrl(dto.getItemImgUrl());
        itemImg.setItemSubImgUrl(dto.getItemSubImgUrl());

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
            .findByItem_ItemIdAndThumbnailYn(itemId, SubImg.Y)
            .orElseThrow(() ->
                new CustomException(ErrorCode.ITEMIMG_NOT_FOUND));

        return toDto(itemImg);
    }

}
