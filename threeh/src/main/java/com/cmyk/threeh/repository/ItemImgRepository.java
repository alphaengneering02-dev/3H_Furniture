package com.cmyk.threeh.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.ItemImg;
import com.cmyk.threeh.enums.SubImg;

//import lombok.extern.java.Log;

public interface ItemImgRepository extends JpaRepository<ItemImg,Long>{
    
    //특정 상품의 모든 이미지 조회
    List<ItemImg> findByItem_ItemId(Long itemId);
    
    //대표 이미지 조회
    Optional<ItemImg> findByItem_ItemIdAndThumbnailYn(
        Long itemId,
        SubImg suthumbnailYn
    );

    //db삭제 성공 후 물리적 이미지 파일 삭제..제발되라..
    // List<ItemImg> findByItem_ItemId(Log itemId); 
    //유소은_ 코드 중복+여기서 lombok.extern.java.Log 사용으로 백엔드 서버가 안켜져서 주석처리
    
    void deleteByItem_ItemId(Long itemId);
}
