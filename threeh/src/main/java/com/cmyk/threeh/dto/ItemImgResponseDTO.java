package com.cmyk.threeh.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemImgResponseDTO {
    
    private Long itemImgId;
    private String imgName;
    private String imgUrl;
    private String subImgUrl;
    private String subImgYn;

}
//이미지 조회 응답용 DTO