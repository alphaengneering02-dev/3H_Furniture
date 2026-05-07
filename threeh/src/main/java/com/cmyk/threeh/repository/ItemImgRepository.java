package com.cmyk.threeh.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.ItemImg;
import com.cmyk.threeh.enums.SubImg;

public interface ItemImgRepository extends JpaRepository<ItemImg,Long>{
    
    //특정 상품의 모든 이미지 조회
    List<ItemImg> findByItem_ItemId(Long itemId);
    
    //대표 이미지 조회
    Optional<ItemImg> findByItem_ItemIdAndThumbnailYn(
        Long itemId,
        SubImg suthumbnailYn
    );

}
