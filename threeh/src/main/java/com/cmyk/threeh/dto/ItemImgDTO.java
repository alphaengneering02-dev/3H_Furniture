package com.cmyk.threeh.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemImgDTO {
    
    private Integer itemImgId;
    private Integer itemId;
    private String imgName;
    private String imgUrl;
    private String subImgUrl;
    private String subimgYn;

}
