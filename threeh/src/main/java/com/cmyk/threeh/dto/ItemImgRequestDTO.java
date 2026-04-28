package com.cmyk.threeh.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemImgRequestDTO {
    
    private Long itemId;
    private String imgName;
    private String imgUrl;
    private String subImgUrl;

}
//이미지 등록 요청용 DTO
