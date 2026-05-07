package com.cmyk.threeh.dto;

import javax.validation.constraints.NotNull;

import com.cmyk.threeh.enums.SubImg;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ItemImgRequestDTO {
    
    @NotNull
    private Long itemId;
    
    private String itemImgName;

    private String itemImgUrl;
    
    private String itemSubImgUrl;
    
    private SubImg thumbnailYn;

}

//사용자가 이미지 등록 요청을 할 때 보내는 데이터용 DTO
