package com.cmyk.threeh.dto;

import javax.validation.constraints.NotNull;

import com.cmyk.threeh.enums.SubImg;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemImgResponseDTO {
    
    @NotNull
    private Long itemImgId;

    private String itemImgName;
    private String itemImgUrl;
    private String itemSubImgUrl;
    private SubImg thumbnailYn;

}
//이미지 조회 응답용 DTO